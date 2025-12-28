import { NextRequest, NextResponse } from "next/server";

// Get days based on timeframe
function getDaysForTimeframe(timeframe: string): number {
    switch (timeframe) {
        case "1m":
        case "5m":
        case "15m":
        case "1h":
        case "4h":
            return 5; // Intraday - last 5 days of data
        case "1D":
            return 90;
        case "1W":
            return 365;
        case "1M":
            return 365 * 3;
        case "1Y":
            return 365;
        default:
            return 365;
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const timeframe = searchParams.get("timeframe") || "1Y";

    if (!symbol) {
        return NextResponse.json(
            { error: "No symbol provided" },
            { status: 400 }
        );
    }

    const days = getDaysForTimeframe(timeframe);

    try {
        // Use backend yfinance API
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
        const url = `${BACKEND_URL}/stock/${symbol}/history?period=1y&interval=1d`;

        const response = await fetch(url, {
            cache: "no-store",
        });

        if (response.ok) {
            const result = await response.json();

            if (
                result.status === "success" &&
                result.data &&
                Array.isArray(result.data)
            ) {
                // Transform to chart format
                const chartData = result.data
                    .slice(0, days)
                    .map((day: any) => ({
                        date: day.Date || day.Datetime,
                        time: day.Date || day.Datetime,
                        open: day.Open,
                        high: day.High,
                        low: day.Low,
                        close: day.Close,
                        volume: day.Volume,
                    }));

                return NextResponse.json(chartData);
            }
        }

        // Return error if no API data available
        return NextResponse.json(
            { error: "Unable to fetch historical data from backend API" },
            { status: 503 }
        );
    } catch (error) {
        console.error("Error fetching historical prices:", error);
        return NextResponse.json(
            { error: "Failed to fetch historical data" },
            { status: 500 }
        );
    }
}

