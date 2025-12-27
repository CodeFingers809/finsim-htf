import { generateMockQuote } from "@/lib/mock-data";

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
        // Try FMP API first
        const FMP_API_KEY = process.env.FMP_API_KEY;
        if (FMP_API_KEY) {
            const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
            const response = await fetch(url, {
                next: { revalidate: 5 }, // Cache for 5 seconds
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    const quote = data[0];
                    return {
                        symbol: quote.symbol,
                        name: quote.name,
                        price: quote.price,
                        changesPercentage: quote.changesPercentage,
                        change: quote.change,
                        dayLow: quote.dayLow,
                        dayHigh: quote.dayHigh,
                        yearHigh: quote.yearHigh,
                        yearLow: quote.yearLow,
                        marketCap: quote.marketCap,
                        priceAvg50: quote.priceAvg50,
                        priceAvg200: quote.priceAvg200,
                        volume: quote.volume,
                        avgVolume: quote.avgVolume,
                        open: quote.open,
                        previousClose: quote.previousClose,
                        eps: quote.eps,
                        pe: quote.pe,
                        earningsAnnouncement: quote.earningsAnnouncement,
                        sharesOutstanding: quote.sharesOutstanding,
                        timestamp: Date.now(),
                    };
                }
            }
        }

        // Try Alpha Vantage as fallback
        const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
        if (ALPHA_VANTAGE_API_KEY) {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url, {
                next: { revalidate: 5 },
            });

            if (response.ok) {
                const data = await response.json();
                const quote = data["Global Quote"];
                if (quote) {
                    return {
                        symbol: quote["01. symbol"],
                        name: symbol,
                        price: parseFloat(quote["05. price"]),
                        change: parseFloat(quote["09. change"]),
                        changesPercentage: parseFloat(
                            quote["10. change percent"].replace("%", "")
                        ),
                        dayLow: parseFloat(quote["04. low"]),
                        dayHigh: parseFloat(quote["03. high"]),
                        open: parseFloat(quote["02. open"]),
                        previousClose: parseFloat(quote["08. previous close"]),
                        volume: parseInt(quote["06. volume"]),
                        yearHigh: 0,
                        yearLow: 0,
                        marketCap: 0,
                        priceAvg50: 0,
                        priceAvg200: 0,
                        avgVolume: 0,
                        eps: 0,
                        pe: 0,
                        timestamp: Date.now(),
                    };
                }
            }
        }
    } catch (error) {
        console.error("Error fetching quote:", error);
    }

    // Return mock data as fallback
    return generateMockQuote(symbol);
}

/**
 * Fetch multiple stock quotes at once
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<Quote[]> {
    try {
        const FMP_API_KEY = process.env.FMP_API_KEY;
        if (FMP_API_KEY) {
            const symbolsParam = symbols.join(",");
            const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsParam}?apikey=${FMP_API_KEY}`;
            const response = await fetch(url, {
                next: { revalidate: 5 },
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data.map((quote: any) => ({
                        symbol: quote.symbol,
                        name: quote.name,
                        price: quote.price,
                        changesPercentage: quote.changesPercentage,
                        change: quote.change,
                        dayLow: quote.dayLow,
                        dayHigh: quote.dayHigh,
                        yearHigh: quote.yearHigh,
                        yearLow: quote.yearLow,
                        marketCap: quote.marketCap,
                        priceAvg50: quote.priceAvg50,
                        priceAvg200: quote.priceAvg200,
                        volume: quote.volume,
                        avgVolume: quote.avgVolume,
                        open: quote.open,
                        previousClose: quote.previousClose,
                        eps: quote.eps,
                        pe: quote.pe,
                        earningsAnnouncement: quote.earningsAnnouncement,
                        sharesOutstanding: quote.sharesOutstanding,
                        timestamp: Date.now(),
                    }));
                }
            }
        }
    } catch (error) {
        console.error("Error fetching multiple quotes:", error);
    }

    // Return mock data for all symbols as fallback
    return symbols.map((symbol) => generateMockQuote(symbol));
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
        const FMP_API_KEY = process.env.FMP_API_KEY;
        if (FMP_API_KEY) {
            let url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
            if (from) url += `&from=${from}`;
            if (to) url += `&to=${to}`;

            const response = await fetch(url, {
                next: { revalidate: 300 }, // Cache for 5 minutes
            });

            if (response.ok) {
                const data = await response.json();
                if (data.historical && Array.isArray(data.historical)) {
                    return data.historical;
                }
            }
        }
    } catch (error) {
        console.error("Error fetching historical data:", error);
    }

    return [];
}

