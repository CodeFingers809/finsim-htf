import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export interface WatchlistStock {
    symbol: string;
    addedAt: string;
}

export interface Watchlist {
    _id: string;
    userId: string;
    name: string;
    stocks: WatchlistStock[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Get all watchlists for a user
 */
export async function getWatchlists(userId: string): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const watchlists = await db
            .collection("watchlists")
            .find({ userId })
            .toArray();

        // Convert ObjectId to string for _id
        const formattedWatchlists = watchlists.map((w) => ({
            ...w,
            _id: w._id.toString(),
        }));

        return NextResponse.json({ watchlists: formattedWatchlists });
    } catch (error) {
        console.error("Error getting watchlists:", error);
        return NextResponse.json(
            { error: "Failed to fetch watchlists" },
            { status: 500 }
        );
    }
}

/**
 * Create a new watchlist
 */
export async function createWatchlist(
    userId: string,
    name: string
): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const collection = db.collection("watchlists");

        // Check if watchlist with same name exists
        const existing = await collection.findOne({ userId, name });
        if (existing) {
            return NextResponse.json(
                { error: "Watchlist with this name already exists" },
                { status: 400 }
            );
        }

        const newWatchlist = {
            userId,
            name,
            stocks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await collection.insertOne(newWatchlist);

        return NextResponse.json(
            {
                watchlist: {
                    ...newWatchlist,
                    _id: result.insertedId.toString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating watchlist:", error);
        return NextResponse.json(
            { error: "Failed to create watchlist" },
            { status: 500 }
        );
    }
}

/**
 * Update watchlist name
 */
export async function updateWatchlistName(
    watchlistId: string,
    userId: string,
    name: string
): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const collection = db.collection("watchlists");

        // Check if another watchlist with same name exists
        const existing = await collection.findOne({
            userId,
            name,
            _id: { $ne: new ObjectId(watchlistId) },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Watchlist with this name already exists" },
                { status: 400 }
            );
        }

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(watchlistId), userId },
            {
                $set: {
                    name,
                    updatedAt: new Date().toISOString(),
                },
            },
            { returnDocument: "after" }
        );

        if (!result) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            watchlist: {
                ...result,
                _id: result._id.toString(),
            },
        });
    } catch (error) {
        console.error("Error updating watchlist:", error);
        return NextResponse.json(
            { error: "Failed to update watchlist" },
            { status: 500 }
        );
    }
}

/**
 * Delete a watchlist
 */
export async function deleteWatchlist(
    watchlistId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const collection = db.collection("watchlists");

        const result = await collection.deleteOne({
            _id: new ObjectId(watchlistId),
            userId,
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting watchlist:", error);
        return NextResponse.json(
            { error: "Failed to delete watchlist" },
            { status: 500 }
        );
    }
}

/**
 * Add stock to watchlist
 */
export async function addStockToWatchlist(
    watchlistId: string,
    userId: string,
    symbol: string
): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const collection = db.collection("watchlists");

        const watchlist = await collection.findOne({
            _id: new ObjectId(watchlistId),
            userId,
        });

        if (!watchlist) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        // Check if stock already exists
        if (watchlist.stocks?.some((s: any) => s.symbol === symbol)) {
            return NextResponse.json(
                { error: "Stock already in watchlist" },
                { status: 400 }
            );
        }

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(watchlistId), userId },
            {
                $push: {
                    stocks: {
                        symbol,
                        addedAt: new Date().toISOString(),
                    },
                } as any,
                $set: {
                    updatedAt: new Date().toISOString(),
                },
            },
            { returnDocument: "after" }
        );

        if (!result) {
            return NextResponse.json(
                { error: "Failed to add stock" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            watchlist: {
                ...result,
                _id: result._id.toString(),
            },
        });
    } catch (error) {
        console.error("Error adding stock to watchlist:", error);
        return NextResponse.json(
            { error: "Failed to add stock to watchlist" },
            { status: 500 }
        );
    }
}

/**
 * Remove stock from watchlist
 */
export async function removeStockFromWatchlist(
    watchlistId: string,
    userId: string,
    symbol: string
): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const collection = db.collection("watchlists");

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(watchlistId), userId },
            {
                $pull: {
                    stocks: { symbol },
                } as any,
                $set: {
                    updatedAt: new Date().toISOString(),
                },
            },
            { returnDocument: "after" }
        );

        if (!result) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            watchlist: {
                ...result,
                _id: result._id.toString(),
            },
        });
    } catch (error) {
        console.error("Error removing stock from watchlist:", error);
        return NextResponse.json(
            { error: "Failed to remove stock from watchlist" },
            { status: 500 }
        );
    }
}

/**
 * Get a single watchlist by ID
 */
export async function getWatchlist(
    watchlistId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const db = await getDatabase();
        const collection = db.collection("watchlists");

        const watchlist = await collection.findOne({
            _id: new ObjectId(watchlistId),
            userId,
        });

        if (!watchlist) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            watchlist: {
                ...watchlist,
                _id: watchlist._id.toString(),
            },
        });
    } catch (error) {
        console.error("Error getting watchlist:", error);
        return NextResponse.json(
            { error: "Failed to fetch watchlist" },
            { status: 500 }
        );
    }
}

