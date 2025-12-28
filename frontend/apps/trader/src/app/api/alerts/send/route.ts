import { NextRequest, NextResponse } from "next/server";

import { getDatabase } from "@/lib/db/mongodb";

const WHATSAPP_SERVER_URL =
    process.env.WHATSAPP_SERVER_URL || "http://localhost:4001";

interface AnnouncementPayload {
    Subject: string;
    Category: string;
    Stock_Code: string;
    Stock_Name: string;
    Date_Time: string;
    PDF_URL?: string;
    File_Hash_SHA256?: string;
    Text_Content?: string;
}

interface UserDoc {
    clerkId: string;
    phoneNumber?: string | null;
    filters: {
        scrips: string[];
        categories: string[];
        keywords: string[];
    };
}

function matchesFilters(
    announcement: AnnouncementPayload,
    user: UserDoc
): boolean {
    const { filters } = user;

    // User has no filters set - they don't want alerts
    if (
        (!filters.scrips || filters.scrips.length === 0) &&
        (!filters.categories || filters.categories.length === 0) &&
        (!filters.keywords || filters.keywords.length === 0)
    ) {
        return false;
    }

    // Check scrip filter - if user has scrips, announcement must match one
    if (filters.scrips && filters.scrips.length > 0) {
        const stockCode = announcement.Stock_Code?.toString().toUpperCase();
        const matchesScrip = filters.scrips.some(
            (scrip) => scrip.toUpperCase() === stockCode
        );
        if (!matchesScrip) return false;
    }

    // Check category filter - if user has categories, announcement must match one
    if (filters.categories && filters.categories.length > 0) {
        const announcementCategory = announcement.Category?.toLowerCase() || "";
        const matchesCategory = filters.categories.some((cat) =>
            announcementCategory.includes(cat.toLowerCase())
        );
        if (!matchesCategory) return false;
    }

    // Check keyword filter - if user has keywords, announcement subject must contain one
    if (filters.keywords && filters.keywords.length > 0) {
        const subject = announcement.Subject?.toLowerCase() || "";
        const textContent = announcement.Text_Content?.toLowerCase() || "";
        const combinedText = `${subject} ${textContent}`;

        const matchesKeyword = filters.keywords.some((keyword) =>
            combinedText.includes(keyword.toLowerCase())
        );
        if (!matchesKeyword) return false;
    }

    return true;
}

async function sendWhatsAppAlert(
    phoneNumber: string,
    announcement: AnnouncementPayload
): Promise<boolean> {
    try {
        // Format announcement for WhatsApp image generator
        const announcementText = [
            `📢 ${announcement.Subject}`,
            ``,
            `🏢 Company: ${announcement.Stock_Name}`,
            `📁 Category: ${announcement.Category}`,
            `🔢 Stock Code: ${announcement.Stock_Code}`,
            `📅 Date: ${announcement.Date_Time}`,
            announcement.PDF_URL ? `📄 PDF: ${announcement.PDF_URL}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const response = await fetch(`${WHATSAPP_SERVER_URL}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                toNumber: phoneNumber,
                announcement: announcementText,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(
                `WhatsApp send failed for ${phoneNumber}:`,
                errorBody
            );
            return false;
        }

        console.log(`✅ Alert sent to ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error(`Failed to send WhatsApp to ${phoneNumber}:`, error);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const announcement: AnnouncementPayload = await request.json();

        if (!announcement.Subject || !announcement.Category) {
            return NextResponse.json(
                { error: "Invalid announcement payload" },
                { status: 400 }
            );
        }

        console.log(`\n📥 Received announcement: ${announcement.Subject}`);
        console.log(`   Category: ${announcement.Category}`);
        console.log(
            `   Stock: ${announcement.Stock_Name} (${announcement.Stock_Code})`
        );

        // Fetch all users with phone numbers from MongoDB
        const db = await getDatabase();
        const usersCollection = db.collection("users");

        const usersWithPhone = await usersCollection
            .find({
                phoneNumber: { $exists: true, $ne: null, $ne: "" },
            })
            .toArray();

        console.log(
            `   Found ${usersWithPhone.length} users with phone numbers`
        );

        // Filter users whose preferences match this announcement
        const matchingUsers: UserDoc[] = [];
        for (const userDoc of usersWithPhone) {
            const user = userDoc as unknown as UserDoc;
            if (matchesFilters(announcement, user)) {
                matchingUsers.push(user);
            }
        }

        console.log(`   ${matchingUsers.length} users match this announcement`);

        // Send WhatsApp alerts to all matching users
        const results = await Promise.allSettled(
            matchingUsers.map((user) =>
                sendWhatsAppAlert(user.phoneNumber!, announcement)
            )
        );

        const successCount = results.filter(
            (r) => r.status === "fulfilled" && r.value === true
        ).length;

        const failCount = results.length - successCount;

        console.log(`   ✅ Sent: ${successCount}, ❌ Failed: ${failCount}`);

        return NextResponse.json({
            success: true,
            announcement: {
                subject: announcement.Subject,
                category: announcement.Category,
                stockCode: announcement.Stock_Code,
            },
            matched_users: matchingUsers.length,
            sent_count: successCount,
            failed_count: failCount,
        });
    } catch (error) {
        console.error("Error processing alert:", error);
        return NextResponse.json(
            { error: "Failed to process alert" },
            { status: 500 }
        );
    }
}

