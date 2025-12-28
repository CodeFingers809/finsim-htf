import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const limit = searchParams.get("limit") || "10";

    if (!symbol) {
        return NextResponse.json(
            { error: "No symbol provided" },
            { status: 400 }
        );
    }

    try {
        // FMP Stock News (FREE)
        const FMP_API_KEY = process.env.FMP_API_KEY;
        if (FMP_API_KEY) {
            const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`;

            const response = await fetch(url, {
                next: { revalidate: 300 }, // Cache for 5 minutes
            });

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    return NextResponse.json({
                        symbol,
                        news: data.map((article: any) => ({
                            symbol: article.symbol,
                            publishedDate: article.publishedDate,
                            title: article.title,
                            image: article.image,
                            site: article.site,
                            text: article.text,
                            url: article.url,
                        })),
                    });
                }
            }
        }

        // Try NewsAPI as fallback
        const NEWS_API_KEY = process.env.NEWS_API_KEY;
        if (NEWS_API_KEY) {
            const url = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${NEWS_API_KEY}&pageSize=${limit}`;

            const response = await fetch(url, {
                next: { revalidate: 300 },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.articles && Array.isArray(data.articles)) {
                    return NextResponse.json({
                        symbol,
                        news: data.articles.map((article: any) => ({
                            symbol: symbol,
                            publishedDate: article.publishedAt,
                            title: article.title,
                            image: article.urlToImage,
                            site: article.source.name,
                            text: article.description,
                            url: article.url,
                        })),
                    });
                }
            }
        }

        // Return error if no API data available
        return NextResponse.json(
            { error: "Unable to fetch stock news from any API" },
            { status: 503 }
        );
    } catch (error) {
        console.error("Error fetching stock news:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock news" },
            { status: 500 }
        );
    }
}

