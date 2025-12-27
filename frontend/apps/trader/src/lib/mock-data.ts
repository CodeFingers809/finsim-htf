// Mock data for fallback when APIs are unavailable

export const MOCK_NEWS = [
    {
        symbol: "AAPL",
        publishedDate: "2024-12-20T10:30:00.000Z",
        title: "Apple announces new AI features in iOS 18",
        image: "https://via.placeholder.com/400x300?text=Apple+News",
        site: "TechCrunch",
        text: "Apple unveiled groundbreaking AI capabilities that will transform how users interact with their devices.",
        url: "https://example.com/article1",
    },
    {
        symbol: "AAPL",
        publishedDate: "2024-12-19T14:20:00.000Z",
        title: "Apple Vision Pro sales exceed expectations",
        image: "https://via.placeholder.com/400x300?text=Vision+Pro",
        site: "Bloomberg",
        text: "The mixed reality headset has gained significant traction among early adopters.",
        url: "https://example.com/article2",
    },
    {
        symbol: "GOOGL",
        publishedDate: "2024-12-20T09:15:00.000Z",
        title: "Google's quantum computing breakthrough",
        image: "https://via.placeholder.com/400x300?text=Google+Quantum",
        site: "Wired",
        text: "Google claims to have achieved quantum supremacy with its latest processor.",
        url: "https://example.com/article3",
    },
    {
        symbol: "MSFT",
        publishedDate: "2024-12-18T16:45:00.000Z",
        title: "Microsoft Azure revenue surges 30%",
        image: "https://via.placeholder.com/400x300?text=Azure",
        site: "CNBC",
        text: "Cloud computing continues to drive Microsoft's growth.",
        url: "https://example.com/article4",
    },
    {
        symbol: "TSLA",
        publishedDate: "2024-12-17T11:30:00.000Z",
        title: "Tesla expands Supercharger network",
        image: "https://via.placeholder.com/400x300?text=Tesla",
        site: "Electrek",
        text: "New charging stations announced across North America and Europe.",
        url: "https://example.com/article5",
    },
];

export const MOCK_COMPANY_OVERVIEW = {
    Symbol: "AAPL",
    AssetType: "Common Stock",
    Name: "Apple Inc.",
    Description:
        "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services.",
    CIK: "320193",
    Exchange: "NASDAQ",
    Currency: "USD",
    Country: "USA",
    Sector: "Technology",
    Industry: "Consumer Electronics",
    Address: "One Apple Park Way, Cupertino, CA, United States",
    FiscalYearEnd: "September",
    LatestQuarter: "2024-09-30",
    MarketCapitalization: "3500000000000",
    EBITDA: "131000000000",
    PERatio: "33.5",
    PEGRatio: "2.8",
    BookValue: "4.25",
    DividendPerShare: "0.96",
    DividendYield: "0.0045",
    EPS: "6.42",
    RevenuePerShareTTM: "25.8",
    ProfitMargin: "0.249",
    OperatingMarginTTM: "0.308",
    ReturnOnAssetsTTM: "0.225",
    ReturnOnEquityTTM: "1.565",
    RevenueTTM: "394328000000",
    GrossProfitTTM: "183365000000",
    DilutedEPSTTM: "6.42",
    QuarterlyEarningsGrowthYOY: "0.11",
    QuarterlyRevenueGrowthYOY: "0.06",
    AnalystTargetPrice: "225.5",
    TrailingPE: "33.5",
    ForwardPE: "28.2",
    PriceToSalesRatioTTM: "8.9",
    PriceToBookRatio: "50.5",
    EVToRevenue: "8.8",
    EVToEBITDA: "26.7",
    Beta: "1.24",
    "52WeekHigh": "237.23",
    "52WeekLow": "164.08",
    "50DayMovingAverage": "226.45",
    "200DayMovingAverage": "208.32",
    SharesOutstanding: "15441000000",
    DividendDate: "2024-11-14",
    ExDividendDate: "2024-11-10",
};

export const MOCK_MARKET_INDICES = [
    {
        symbol: "^GSPC",
        name: "S&P 500",
        price: 4783.45,
        changesPercentage: 0.75,
        change: 35.67,
        dayLow: 4750.23,
        dayHigh: 4790.12,
        yearHigh: 4818.62,
        yearLow: 3808.23,
        marketCap: null,
        priceAvg50: 4712.34,
        priceAvg200: 4523.45,
        volume: 3245678900,
        avgVolume: 3500000000,
    },
    {
        symbol: "^DJI",
        name: "Dow Jones Industrial Average",
        price: 37305.16,
        changesPercentage: 0.52,
        change: 192.51,
        dayLow: 37150.45,
        dayHigh: 37320.78,
        yearHigh: 37395.37,
        yearLow: 31429.82,
        marketCap: null,
        priceAvg50: 36892.45,
        priceAvg200: 35678.23,
        volume: 387654321,
        avgVolume: 400000000,
    },
    {
        symbol: "^IXIC",
        name: "NASDAQ Composite",
        price: 14813.92,
        changesPercentage: 1.02,
        change: 149.75,
        dayLow: 14680.34,
        dayHigh: 14825.67,
        yearHigh: 14932.76,
        yearLow: 10088.83,
        marketCap: null,
        priceAvg50: 14523.45,
        priceAvg200: 13892.12,
        volume: 5234567890,
        avgVolume: 5500000000,
    },
    {
        symbol: "^RUT",
        name: "Russell 2000",
        price: 2027.07,
        changesPercentage: 0.45,
        change: 9.08,
        dayLow: 2015.34,
        dayHigh: 2030.45,
        yearHigh: 2124.55,
        yearLow: 1636.93,
        marketCap: null,
        priceAvg50: 1989.23,
        priceAvg200: 1923.67,
        volume: 34567890,
        avgVolume: 40000000,
    },
];

export const MOCK_SECTORS = [
    { name: "Technology", performance: "2.45%" },
    { name: "Healthcare", performance: "1.32%" },
    { name: "Financial Services", performance: "0.87%" },
    { name: "Consumer Cyclical", performance: "1.65%" },
    { name: "Industrials", performance: "0.54%" },
    { name: "Energy", performance: "-0.23%" },
    { name: "Utilities", performance: "0.12%" },
    { name: "Real Estate", performance: "-0.45%" },
    { name: "Basic Materials", performance: "0.76%" },
    { name: "Consumer Defensive", performance: "0.34%" },
    { name: "Communication Services", performance: "1.89%" },
];

export const MOCK_TOP_MOVERS = [
    {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 495.22,
        change: 23.45,
        changesPercentage: 4.97,
        volume: 45678900,
    },
    {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        price: 147.89,
        change: 6.78,
        changesPercentage: 4.81,
        volume: 67890123,
    },
    {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        price: 248.42,
        change: 11.23,
        changesPercentage: 4.73,
        volume: 123456789,
    },
    {
        symbol: "META",
        name: "Meta Platforms Inc.",
        price: 352.67,
        change: -15.89,
        changesPercentage: -4.31,
        volume: 23456789,
    },
    {
        symbol: "NFLX",
        name: "Netflix Inc.",
        price: 445.12,
        change: -18.45,
        changesPercentage: -3.98,
        volume: 8901234,
    },
];

export const MOCK_IPOS = [
    {
        symbol: "NEWCO",
        name: "NewCo Technologies",
        date: "2025-01-15",
        priceRange: "$18-$22",
        shares: "10000000",
        status: "upcoming",
    },
    {
        symbol: "TECH2",
        name: "Tech Solutions Inc",
        date: "2025-01-22",
        priceRange: "$25-$30",
        shares: "8500000",
        status: "upcoming",
    },
    {
        symbol: "BIOTECH",
        name: "BioTech Innovations",
        date: "2024-12-15",
        priceRange: "$15-$18",
        shares: "12000000",
        status: "priced",
        openPrice: "$17.50",
    },
];

export const MOCK_STOCKS = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
];

export function generateMockQuote(symbol: string) {
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    const changesPercentage = (change / basePrice) * 100;

    return {
        symbol: symbol.toUpperCase(),
        name: `${symbol} Company`,
        price: parseFloat(basePrice.toFixed(2)),
        changesPercentage: parseFloat(changesPercentage.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        dayLow: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
        dayHigh: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
        yearHigh: parseFloat((basePrice * 1.3).toFixed(2)),
        yearLow: parseFloat((basePrice * 0.7).toFixed(2)),
        marketCap: Math.floor(basePrice * 1000000000),
        priceAvg50: parseFloat((basePrice * 0.98).toFixed(2)),
        priceAvg200: parseFloat((basePrice * 0.95).toFixed(2)),
        volume: Math.floor(1000000 + Math.random() * 10000000),
        avgVolume: Math.floor(1500000 + Math.random() * 8000000),
        open: parseFloat((basePrice - change).toFixed(2)),
        previousClose: parseFloat((basePrice - change).toFixed(2)),
        eps: parseFloat((Math.random() * 10).toFixed(2)),
        pe: parseFloat((15 + Math.random() * 20).toFixed(2)),
        earningsAnnouncement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        sharesOutstanding: Math.floor(basePrice * 10000000),
        timestamp: Date.now(),
    };
}

export function generateMockHistoricalData(symbol: string, days: number = 365) {
    const basePrice = 100 + Math.random() * 400;
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const trendFactor = (days - i) / days;
        const variance = (Math.random() - 0.5) * 15;
        const priceBase = basePrice * (1 + trendFactor * 0.2);
        const open = priceBase + variance;
        const close = open + (Math.random() - 0.5) * 8;
        const high = Math.max(open, close) + Math.random() * 4;
        const low = Math.min(open, close) - Math.random() * 4;
        const volume = Math.floor(500000 + Math.random() * 3000000);

        data.push({
            date: dateStr,
            time: dateStr,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
        });
    }

    return data;
}

