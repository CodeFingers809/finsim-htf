import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return NextResponse.json(
            { error: "No symbol provided" },
            { status: 400 }
        );
    }

    try {
        // Use backend yfinance API
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
        const url = `${BACKEND_URL}/stocks/history?tickers=${symbol}&period=5d&interval=1d`;

        const response = await fetch(url, {
            cache: "no-store",
        });

        if (response.ok) {
            const result = await response.json();

            if (
                result.status === "success" &&
                result.data &&
                result.data[symbol]
            ) {
                const histData = result.data[symbol];

                if (Array.isArray(histData) && histData.length > 0) {
                    const latest = histData[histData.length - 1];
                    const previous =
                        histData.length > 1
                            ? histData[histData.length - 2]
                            : latest;

                    const close = latest.Close || 0;
                    const prevClose = previous.Close || close;
                    const change = close - prevClose;
                    const changePercent =
                        prevClose !== 0 ? (change / prevClose) * 100 : 0;

                    return NextResponse.json({
                        symbol: symbol,
                        name: symbol,
                        price: close,
                        lastPrice: close,
                        changesPercentage: changePercent,
                        changePercent: changePercent,
                        change: change,
                        dayLow: latest.Low || 0,
                        dayHigh: latest.High || 0,
                        yearHigh: Math.max(
                            ...histData.map((d: any) => d.High || 0)
                        ),
                        yearLow: Math.min(
                            ...histData.map((d: any) => d.Low || Infinity)
                        ),
                        volume: latest.Volume || 0,
                        open: latest.Open || 0,
                        previousClose: prevClose,
                        timestamp: Date.now(),
                    });
                }
            }
        }

        // Return error if no API data available
        return NextResponse.json(
            { error: "Unable to fetch quote data from backend API" },
            { status: 503 }
        );
    } catch (error) {
        console.error("Error fetching quote:", error);
        return NextResponse.json(
            { error: "Failed to fetch quote data" },
            { status: 500 }
        );
    }
}

