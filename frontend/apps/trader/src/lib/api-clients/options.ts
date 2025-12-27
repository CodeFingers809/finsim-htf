export interface OptionContract {
    contractSymbol: string;
    strike: number;
    expiration: string;
    lastPrice: number;
    bid: number;
    ask: number;
    change: number;
    percentChange: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
    inTheMoney: boolean;
    lastTradeDate: string;
}

export interface OptionChain {
    calls: OptionContract[];
    puts: OptionContract[];
    expirationDates?: string[];
}

/**
 * Generate mock option contracts for fallback
 */
function generateMockOptions(
    symbol: string,
    strike: number,
    expiration: string,
    isCall: boolean
): OptionContract {
    const basePrice = strike * 0.05;
    const randomFactor = Math.random() * 0.5 + 0.5;
    const lastPrice = basePrice * randomFactor;
    const spread = lastPrice * 0.05;

    return {
        contractSymbol: `${symbol}${expiration.replace(/-/g, "")}${
            isCall ? "C" : "P"
        }${strike}`,
        strike,
        expiration,
        lastPrice: parseFloat(lastPrice.toFixed(2)),
        bid: parseFloat((lastPrice - spread).toFixed(2)),
        ask: parseFloat((lastPrice + spread).toFixed(2)),
        change: parseFloat(
            ((Math.random() - 0.5) * lastPrice * 0.2).toFixed(2)
        ),
        percentChange: parseFloat(((Math.random() - 0.5) * 20).toFixed(2)),
        volume: Math.floor(Math.random() * 10000),
        openInterest: Math.floor(Math.random() * 50000),
        impliedVolatility: parseFloat((Math.random() * 0.8 + 0.2).toFixed(4)),
        inTheMoney: isCall ? strike < 100 : strike > 100,
        lastTradeDate: new Date().toISOString(),
    };
}

/**
 * Fetch option chain for a symbol
 */
export async function fetchOptionChain(
    symbol: string,
    expiry?: string
): Promise<OptionChain> {
    try {
        // Try Tradier API if available
        const TRADIER_API_KEY = process.env.TRADIER_API_KEY;
        if (TRADIER_API_KEY) {
            let url = `https://api.tradier.com/v1/markets/options/chains?symbol=${symbol}&greeks=true`;
            if (expiry) {
                url += `&expiration=${expiry}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${TRADIER_API_KEY}`,
                    Accept: "application/json",
                },
                next: { revalidate: 60 }, // Cache for 1 minute
            });

            if (response.ok) {
                const data = await response.json();
                if (data.options && data.options.option) {
                    const options = Array.isArray(data.options.option)
                        ? data.options.option
                        : [data.options.option];

                    const calls: OptionContract[] = [];
                    const puts: OptionContract[] = [];

                    options.forEach((opt: any) => {
                        const contract: OptionContract = {
                            contractSymbol: opt.symbol,
                            strike: opt.strike,
                            expiration: opt.expiration_date,
                            lastPrice: opt.last || 0,
                            bid: opt.bid || 0,
                            ask: opt.ask || 0,
                            change: opt.change || 0,
                            percentChange: opt.change_percentage || 0,
                            volume: opt.volume || 0,
                            openInterest: opt.open_interest || 0,
                            impliedVolatility: opt.greeks?.mid_iv || 0,
                            inTheMoney: opt.in_the_money || false,
                            lastTradeDate:
                                opt.last_trade_date || opt.expiration_date,
                        };

                        if (opt.option_type === "call") {
                            calls.push(contract);
                        } else {
                            puts.push(contract);
                        }
                    });

                    return { calls, puts };
                }
            }
        }

        // Try Yahoo Finance options API as fallback
        const YF_API_KEY = process.env.YAHOO_FINANCE_API_KEY;
        if (YF_API_KEY) {
            const url = expiry
                ? `https://query2.finance.yahoo.com/v7/finance/options/${symbol}?date=${
                      new Date(expiry).getTime() / 1000
                  }`
                : `https://query2.finance.yahoo.com/v7/finance/options/${symbol}`;

            const response = await fetch(url, {
                next: { revalidate: 60 },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.optionChain?.result?.[0]) {
                    const result = data.optionChain.result[0];
                    const calls =
                        result.options?.[0]?.calls?.map((opt: any) => ({
                            contractSymbol: opt.contractSymbol,
                            strike: opt.strike,
                            expiration: new Date(opt.expiration * 1000)
                                .toISOString()
                                .split("T")[0],
                            lastPrice: opt.lastPrice,
                            bid: opt.bid,
                            ask: opt.ask,
                            change: opt.change,
                            percentChange: opt.percentChange,
                            volume: opt.volume,
                            openInterest: opt.openInterest,
                            impliedVolatility: opt.impliedVolatility,
                            inTheMoney: opt.inTheMoney,
                            lastTradeDate: new Date(
                                opt.lastTradeDate * 1000
                            ).toISOString(),
                        })) || [];

                    const puts =
                        result.options?.[0]?.puts?.map((opt: any) => ({
                            contractSymbol: opt.contractSymbol,
                            strike: opt.strike,
                            expiration: new Date(opt.expiration * 1000)
                                .toISOString()
                                .split("T")[0],
                            lastPrice: opt.lastPrice,
                            bid: opt.bid,
                            ask: opt.ask,
                            change: opt.change,
                            percentChange: opt.percentChange,
                            volume: opt.volume,
                            openInterest: opt.openInterest,
                            impliedVolatility: opt.impliedVolatility,
                            inTheMoney: opt.inTheMoney,
                            lastTradeDate: new Date(
                                opt.lastTradeDate * 1000
                            ).toISOString(),
                        })) || [];

                    return { calls, puts };
                }
            }
        }
    } catch (error) {
        console.error("Error fetching option chain:", error);
    }

    // Return mock data as fallback
    const mockExpiry =
        expiry ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
    const strikes = [85, 90, 95, 100, 105, 110, 115, 120];

    return {
        calls: strikes.map((strike) =>
            generateMockOptions(symbol, strike, mockExpiry, true)
        ),
        puts: strikes.map((strike) =>
            generateMockOptions(symbol, strike, mockExpiry, false)
        ),
        expirationDates: [
            mockExpiry,
            new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        ],
    };
}

/**
 * Fetch available expiration dates for a symbol
 */
export async function fetchExpirationDates(symbol: string): Promise<string[]> {
    try {
        const TRADIER_API_KEY = process.env.TRADIER_API_KEY;
        if (TRADIER_API_KEY) {
            const url = `https://api.tradier.com/v1/markets/options/expirations?symbol=${symbol}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${TRADIER_API_KEY}`,
                    Accept: "application/json",
                },
                next: { revalidate: 3600 }, // Cache for 1 hour
            });

            if (response.ok) {
                const data = await response.json();
                if (data.expirations?.date) {
                    return Array.isArray(data.expirations.date)
                        ? data.expirations.date
                        : [data.expirations.date];
                }
            }
        }
    } catch (error) {
        console.error("Error fetching expiration dates:", error);
    }

    // Return mock expiration dates
    const dates = [];
    for (let i = 1; i <= 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        // Set to third Friday of the month (typical options expiration)
        date.setDate(1);
        const firstDay = date.getDay();
        const fridayDate = 1 + ((5 - firstDay + 7) % 7) + 14;
        date.setDate(fridayDate);
        dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
}

