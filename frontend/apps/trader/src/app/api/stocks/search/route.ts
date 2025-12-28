import { NextResponse } from "next/server";
import axios from "axios";

const ALPHA_VANTAGE_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || "demo";
const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

// Fallback popular stocks if API fails - Expanded list
const FALLBACK_STOCKS = [
    // Indian Stocks (NSE/BSE)
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
    { symbol: "INFY.NS", name: "Infosys" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
    { symbol: "ITC.NS", name: "ITC Limited" },
    { symbol: "SBIN.NS", name: "State Bank of India" },
    { symbol: "BHARTIARTL.NS", name: "Bharti Airtel" },
    { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank" },
    { symbol: "LT.NS", name: "Larsen & Toubro" },
    { symbol: "AXISBANK.NS", name: "Axis Bank" },
    { symbol: "ASIANPAINT.NS", name: "Asian Paints" },
    { symbol: "MARUTI.NS", name: "Maruti Suzuki" },
    { symbol: "TITAN.NS", name: "Titan Company" },
    { symbol: "WIPRO.NS", name: "Wipro" },
    { symbol: "HCLTECH.NS", name: "HCL Technologies" },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
    { symbol: "TATASTEEL.NS", name: "Tata Steel" },
    { symbol: "BAJFINANCE.NS", name: "Bajaj Finance" },
    { symbol: "ADANIGREEN.NS", name: "Adani Green Energy" },
    { symbol: "ADANIPORTS.NS", name: "Adani Ports" },
    { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement" },
    { symbol: "SUNPHARMA.NS", name: "Sun Pharma" },
    { symbol: "NESTLEIND.NS", name: "Nestle India" },
    { symbol: "TECHM.NS", name: "Tech Mahindra" },
    { symbol: "POWERGRID.NS", name: "Power Grid Corporation" },
    { symbol: "ONGC.NS", name: "Oil and Natural Gas Corporation" },
    { symbol: "NTPC.NS", name: "NTPC Limited" },
    { symbol: "JSWSTEEL.NS", name: "JSW Steel" },
    { symbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories" },
    { symbol: "CIPLA.NS", name: "Cipla Limited" },
    { symbol: "DIVISLAB.NS", name: "Divi's Laboratories" },
    { symbol: "EICHERMOT.NS", name: "Eicher Motors" },
    { symbol: "GRASIM.NS", name: "Grasim Industries" },
    { symbol: "HEROMOTOCO.NS", name: "Hero MotoCorp" },
    { symbol: "BRITANNIA.NS", name: "Britannia Industries" },
    { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv" },
    { symbol: "M&M.NS", name: "Mahindra & Mahindra" },
    { symbol: "INDUSINDBK.NS", name: "IndusInd Bank" },
    { symbol: "SHREECEM.NS", name: "Shree Cement" },
    { symbol: "COALINDIA.NS", name: "Coal India" },
    { symbol: "BPCL.NS", name: "Bharat Petroleum" },
    { symbol: "TATACONSUM.NS", name: "Tata Consumer Products" },
    { symbol: "HAVELLS.NS", name: "Havells India" },
    { symbol: "GODREJCP.NS", name: "Godrej Consumer Products" },

    // US Stocks
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices" },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "PYPL", name: "PayPal Holdings" },
    { symbol: "CSCO", name: "Cisco Systems" },
    { symbol: "ORCL", name: "Oracle Corporation" },
    { symbol: "CRM", name: "Salesforce Inc." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "QCOM", name: "Qualcomm Inc." },
    { symbol: "TXN", name: "Texas Instruments" },
    { symbol: "COST", name: "Costco Wholesale" },
    { symbol: "PEP", name: "PepsiCo Inc." },
    { symbol: "KO", name: "The Coca-Cola Company" },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "DIS", name: "The Walt Disney Company" },
    { symbol: "BA", name: "Boeing Company" },
    { symbol: "NKE", name: "Nike Inc." },
    { symbol: "MCD", name: "McDonald's Corporation" },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "BAC", name: "Bank of America" },
    { symbol: "GS", name: "Goldman Sachs" },
    { symbol: "MS", name: "Morgan Stanley" },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    try {
        // Use Alpha Vantage SYMBOL_SEARCH endpoint
        const { data } = await axios.get(ALPHA_VANTAGE_BASE, {
            params: {
                function: "SYMBOL_SEARCH",
                keywords: query,
                apikey: ALPHA_VANTAGE_KEY,
            },
            timeout: 5000,
        });

        if (data.bestMatches && data.bestMatches.length > 0) {
            const results = data.bestMatches.slice(0, 10).map((match: any) => ({
                symbol: match["1. symbol"],
                name: match["2. name"],
            }));
            return NextResponse.json(results);
        }
    } catch (error) {
        console.warn("Alpha Vantage search failed, using fallback:", error);
    }

    // Fallback to local search
    const results = FALLBACK_STOCKS.filter(
        (stock) =>
            stock.symbol.toLowerCase().includes(query) ||
            stock.name.toLowerCase().includes(query)
    ).slice(0, 10);

    return NextResponse.json(results);
}

