export interface Quote {
    symbol: string;
    name: string;
    price: number;
    changesPercentage: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number;
    priceAvg50: number;
    priceAvg200: number;
    volume: number;
    avgVolume: number;
    open: number;
    previousClose: number;
    eps: number;
    pe: number;
    earningsAnnouncement?: string;
    sharesOutstanding?: number;
    timestamp: number;
}

/**
 * Fetch a single stock quote
 */
export async function fetchQuote(symbol: string): Promise<Quote> {
    try {
        // Use backend yfinance API
        const quotes = await fetchMultipleQuotes([symbol]);
        if (quotes.length > 0) {
            return quotes[0];
        }
        throw new Error(`No quote data available for ${symbol}`);
    } catch (error) {
        console.error("Error fetching quote:", error);
        throw error;
    }
}

export async function fetchMultipleQuotes(symbols: string[]): Promise<Quote[]> {
    try {
        // Fetch each stock individually to avoid NaN parsing issues
        const BACKEND_URL =
            process.env.BACKEND_URL ||
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            "http://localhost:3001";

        const quotes: Quote[] = [];

        // Fetch stocks one by one
        for (const symbol of symbols) {
            try {
                const url = `${BACKEND_URL}/stocks/history?tickers=${symbol}&period=5d&interval=1d`;
                const response = await fetch(url, {
                    next: { revalidate: 60 },
                });

                if (response.ok) {
                    const result = await response.json();
                    if (
                        result.status === "success" &&
                        result.data &&
                        result.data[symbol]
                    ) {
                        const stockData = result.data[symbol];
                        const histData = stockData.data || stockData;
                        const currency = stockData.currency || "USD";

                        if (Array.isArray(histData) && histData.length > 0) {
                            const latest = histData[histData.length - 1];
                            const previous =
                                histData.length > 1
                                    ? histData[histData.length - 2]
                                    : latest;

                            const close = latest.Close ?? 0;
                            const prevClose = previous.Close ?? close;

                            // Skip if data is invalid
                            if (
                                !isFinite(close) ||
                                close === 0 ||
                                !isFinite(prevClose)
                            ) {
                                console.warn(
                                    `Skipping ${symbol} - invalid data`
                                );
                                continue;
                            }

                            const change = close - prevClose;
                            const changePercent =
                                prevClose !== 0
                                    ? (change / prevClose) * 100
                                    : 0;

                            quotes.push({
                                symbol,
                                lastPrice: close,
                                change,
                                changePercent,
                                dayHigh: latest.High ?? close,
                                dayLow: latest.Low ?? close,
                                open: latest.Open ?? close,
                                volume: latest.Volume ?? 0,
                                previousClose: prevClose,
                                currency,
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error fetching ${symbol}:`, error);
            }
        }

        return quotes;
    } catch (error) {
        console.error("Error fetching multiple quotes:", error);
        throw error;
    }
}

/**
 * Fetch historical price data for a symbol
 */
export async function fetchHistoricalData(
    symbol: string,
    from?: string,
    to?: string
): Promise<any[]> {
    try {
        const BACKEND_URL =
            process.env.BACKEND_URL ||
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            "http://localhost:3001";
        const url = `${BACKEND_URL}/stock/${symbol}/history?period=1y&interval=1d`;

        const response = await fetch(url, {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (response.ok) {
            const result = await response.json();
            if (
                result.status === "success" &&
                result.data &&
                Array.isArray(result.data)
            ) {
                return result.data.map((day: any) => ({
                    date: day.Date || day.Datetime,
                    open: day.Open,
                    high: day.High,
                    low: day.Low,
                    close: day.Close,
                    volume: day.Volume,
                }));
            }
        }
    } catch (error) {
        console.error("Error fetching historical data:", error);
    }

    return [];
}

