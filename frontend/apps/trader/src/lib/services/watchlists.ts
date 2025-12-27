import { NextResponse } from "next/server";

// In-memory storage for demo purposes
// In production, replace with database calls
const watchlistsStore = new Map<string, Watchlist[]>();

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
        const watchlists = watchlistsStore.get(userId) || [];
        return NextResponse.json({ watchlists });
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
        const userWatchlists = watchlistsStore.get(userId) || [];

        // Check if watchlist with same name exists
        if (userWatchlists.some((w) => w.name === name)) {
            return NextResponse.json(
                { error: "Watchlist with this name already exists" },
                { status: 400 }
            );
        }

        const newWatchlist: Watchlist = {
            _id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            name,
            stocks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        userWatchlists.push(newWatchlist);
        watchlistsStore.set(userId, userWatchlists);

        return NextResponse.json({ watchlist: newWatchlist }, { status: 201 });
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
        const userWatchlists = watchlistsStore.get(userId) || [];
        const watchlist = userWatchlists.find((w) => w._id === watchlistId);

        if (!watchlist) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        // Check if another watchlist with same name exists
        if (
            userWatchlists.some((w) => w.name === name && w._id !== watchlistId)
        ) {
            return NextResponse.json(
                { error: "Watchlist with this name already exists" },
                { status: 400 }
            );
        }

        watchlist.name = name;
        watchlist.updatedAt = new Date().toISOString();
        watchlistsStore.set(userId, userWatchlists);

        return NextResponse.json({ watchlist });
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
        const userWatchlists = watchlistsStore.get(userId) || [];
        const filteredWatchlists = userWatchlists.filter(
            (w) => w._id !== watchlistId
        );

        if (filteredWatchlists.length === userWatchlists.length) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        watchlistsStore.set(userId, filteredWatchlists);
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
        const userWatchlists = watchlistsStore.get(userId) || [];
        const watchlist = userWatchlists.find((w) => w._id === watchlistId);

        if (!watchlist) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        // Check if stock already exists
        if (watchlist.stocks.some((s) => s.symbol === symbol)) {
            return NextResponse.json(
                { error: "Stock already in watchlist" },
                { status: 400 }
            );
        }

        watchlist.stocks.push({
            symbol,
            addedAt: new Date().toISOString(),
        });
        watchlist.updatedAt = new Date().toISOString();
        watchlistsStore.set(userId, userWatchlists);

        return NextResponse.json({ watchlist });
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
        const userWatchlists = watchlistsStore.get(userId) || [];
        const watchlist = userWatchlists.find((w) => w._id === watchlistId);

        if (!watchlist) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        watchlist.stocks = watchlist.stocks.filter((s) => s.symbol !== symbol);
        watchlist.updatedAt = new Date().toISOString();
        watchlistsStore.set(userId, userWatchlists);

        return NextResponse.json({ watchlist });
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
        const userWatchlists = watchlistsStore.get(userId) || [];
        const watchlist = userWatchlists.find((w) => w._id === watchlistId);

        if (!watchlist) {
            return NextResponse.json(
                { error: "Watchlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ watchlist });
    } catch (error) {
        console.error("Error getting watchlist:", error);
        return NextResponse.json(
            { error: "Failed to fetch watchlist" },
            { status: 500 }
        );
    }
}

