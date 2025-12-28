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
        // Use backend yfinance API for company info
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
        const url = `${BACKEND_URL}/stock/${symbol}/info`;

        const response = await fetch(url, {
            cache: "no-store",
        });

        if (response.ok) {
            const result = await response.json();

            if (result.status === "success" && result.data) {
                const info = result.data;

                return NextResponse.json({
                    symbol: info.symbol || symbol,
                    assetType: "Common Stock",
                    name: info.longName || info.shortName || symbol,
                    description: info.longBusinessSummary || "",
                    exchange: info.exchange || "",
                    currency: info.currency || "USD",
                    country: info.country || "",
                    sector: info.sector || "",
                    industry: info.industry || "",
                    address: info.address1 || "",
                    website: info.website || "",
                    ceo: "",
                    employees: info.fullTimeEmployees || 0,
                    fiscalYearEnd: "",
                    latestQuarter: "",
                    marketCapitalization: info.marketCap || 0,
                    ebitda: info.ebitda || 0,
                    peRatio: info.trailingPE || info.forwardPE || 0,
                    pegRatio: info.pegRatio || 0,
                    bookValue: info.bookValue || 0,
                    dividendPerShare: info.dividendRate || 0,
                    dividendYield: info.dividendYield || 0,
                    eps: info.trailingEps || 0,
                    revenuePerShareTTM: info.revenuePerShare || 0,
                    profitMargin: info.profitMargins || 0,
                    operatingMarginTTM: info.operatingMargins || 0,
                    returnOnAssetsTTM: info.returnOnAssets || 0,
                    returnOnEquityTTM: info.returnOnEquity || 0,
                    revenueTTM: info.totalRevenue || 0,
                    grossProfitTTM: info.grossProfits || 0,
                    dilutedEPSTTM: info.trailingEps || 0,
                    quarterlyEarningsGrowthYOY:
                        info.earningsQuarterlyGrowth || 0,
                    quarterlyRevenueGrowthYOY: info.revenueGrowth || 0,
                    analystTargetPrice: info.targetMeanPrice || 0,
                    trailingPE: info.trailingPE || 0,
                    forwardPE: info.forwardPE || 0,
                    priceToSalesRatioTTM:
                        info.priceToSalesTrailing12Months || 0,
                    priceToBookRatio: info.priceToBook || 0,
                    evToRevenue: info.enterpriseToRevenue || 0,
                    evToEBITDA: info.enterpriseToEbitda || 0,
                    beta: info.beta || 0,
                    week52High: info.fiftyTwoWeekHigh || 0,
                    week52Low: info.fiftyTwoWeekLow || 0,
                    day50MovingAverage: info.fiftyDayAverage || 0,
                    day200MovingAverage: info.twoHundredDayAverage || 0,
                    sharesOutstanding: info.sharesOutstanding || 0,
                    dividendDate: info.dividendDate || "",
                    exDividendDate: info.exDividendDate || "",
                });
            }
        }

        // Return error if no API data available
        return NextResponse.json(
            { error: "Unable to fetch company overview from backend API" },
            { status: 503 }
        );
    } catch (error) {
        console.error("Error fetching company overview:", error);
        return NextResponse.json(
            { error: "Failed to fetch company overview" },
            { status: 500 }
        );
    }
}

