import { NextResponse } from "next/server";

export interface StrategyLeg {
    type: "equity" | "option";
    action: "buy" | "sell";
    symbol: string;
    strike?: number;
    expiry?: Date;
    quantity: number;
    orderType: "market" | "limit";
    limitPrice?: number;
}

export interface Strategy {
    id: string;
    userId: string;
    name: string;
    description?: string;
    legs: StrategyLeg[];
    totalCost: number;
    maxProfit?: number;
    maxLoss?: number;
    breakeven?: number[];
    createdAt: Date;
    updatedAt: Date;
}

// In-memory storage for demo purposes
const strategiesStore = new Map<string, Strategy[]>();

/**
 * Calculate strategy metrics (simplified)
 */
function calculateStrategyMetrics(legs: StrategyLeg[]) {
    let totalCost = 0;
    const commission = 0.65 * legs.length;

    for (const leg of legs) {
        let legCost = 0;

        if (leg.type === "equity") {
            const price = leg.limitPrice || 100;
            legCost = price * leg.quantity;
        } else {
            const optionPrice = leg.limitPrice || 5;
            legCost = optionPrice * leg.quantity * 100;
        }

        if (leg.action === "buy") {
            totalCost += legCost;
        } else {
            totalCost -= legCost;
        }
    }

    totalCost += commission;

    // Simplified metrics (would need more complex calculations for real scenarios)
    let maxProfit: number | undefined = undefined;
    let maxLoss: number | undefined = undefined;

    // For debit spreads, max loss is the debit paid
    if (totalCost > 0) {
        maxLoss = totalCost;
    }

    // For credit spreads, max profit is the credit received
    if (totalCost < 0) {
        maxProfit = Math.abs(totalCost);
    }

    return {
        totalCost: parseFloat(totalCost.toFixed(2)),
        maxProfit,
        maxLoss,
        breakeven: undefined, // Would need more complex calculations
    };
}

/**
 * Get all strategies for a user
 */
export async function getStrategies(userId: string): Promise<NextResponse> {
    try {
        const strategies = strategiesStore.get(userId) || [];
        return NextResponse.json({ strategies });
    } catch (error) {
        console.error("Error getting strategies:", error);
        return NextResponse.json(
            { error: "Failed to fetch strategies" },
            { status: 500 }
        );
    }
}

/**
 * Get a single strategy by ID
 */
export async function getStrategy(
    strategyId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userStrategies = strategiesStore.get(userId) || [];
        const strategy = userStrategies.find((s) => s.id === strategyId);

        if (!strategy) {
            return NextResponse.json(
                { error: "Strategy not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ strategy });
    } catch (error) {
        console.error("Error getting strategy:", error);
        return NextResponse.json(
            { error: "Failed to fetch strategy" },
            { status: 500 }
        );
    }
}

/**
 * Create a new strategy
 */
export async function createStrategy(
    userId: string,
    strategyData: {
        name: string;
        description?: string;
        legs: StrategyLeg[];
    }
): Promise<NextResponse> {
    try {
        const userStrategies = strategiesStore.get(userId) || [];

        // Check if strategy with same name exists
        if (userStrategies.some((s) => s.name === strategyData.name)) {
            return NextResponse.json(
                { error: "Strategy with this name already exists" },
                { status: 400 }
            );
        }

        // Calculate metrics
        const metrics = calculateStrategyMetrics(strategyData.legs);

        const newStrategy: Strategy = {
            id: `strat_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            userId,
            name: strategyData.name,
            description: strategyData.description,
            legs: strategyData.legs,
            totalCost: metrics.totalCost,
            maxProfit: metrics.maxProfit,
            maxLoss: metrics.maxLoss,
            breakeven: metrics.breakeven,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        userStrategies.push(newStrategy);
        strategiesStore.set(userId, userStrategies);

        return NextResponse.json({ strategy: newStrategy }, { status: 201 });
    } catch (error) {
        console.error("Error creating strategy:", error);
        return NextResponse.json(
            { error: "Failed to create strategy" },
            { status: 500 }
        );
    }
}

/**
 * Update a strategy
 */
export async function updateStrategy(
    strategyId: string,
    userId: string,
    updates: {
        name?: string;
        description?: string;
        legs?: StrategyLeg[];
    }
): Promise<NextResponse> {
    try {
        const userStrategies = strategiesStore.get(userId) || [];
        const strategy = userStrategies.find((s) => s.id === strategyId);

        if (!strategy) {
            return NextResponse.json(
                { error: "Strategy not found" },
                { status: 404 }
            );
        }

        // Check if another strategy with same name exists
        if (
            updates.name &&
            userStrategies.some(
                (s) => s.name === updates.name && s.id !== strategyId
            )
        ) {
            return NextResponse.json(
                { error: "Strategy with this name already exists" },
                { status: 400 }
            );
        }

        // Apply updates
        if (updates.name) strategy.name = updates.name;
        if (updates.description !== undefined)
            strategy.description = updates.description;

        if (updates.legs) {
            strategy.legs = updates.legs;
            // Recalculate metrics
            const metrics = calculateStrategyMetrics(updates.legs);
            strategy.totalCost = metrics.totalCost;
            strategy.maxProfit = metrics.maxProfit;
            strategy.maxLoss = metrics.maxLoss;
            strategy.breakeven = metrics.breakeven;
        }

        strategy.updatedAt = new Date();
        strategiesStore.set(userId, userStrategies);

        return NextResponse.json({ strategy });
    } catch (error) {
        console.error("Error updating strategy:", error);
        return NextResponse.json(
            { error: "Failed to update strategy" },
            { status: 500 }
        );
    }
}

/**
 * Delete a strategy
 */
export async function deleteStrategy(
    strategyId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userStrategies = strategiesStore.get(userId) || [];
        const filteredStrategies = userStrategies.filter(
            (s) => s.id !== strategyId
        );

        if (filteredStrategies.length === userStrategies.length) {
            return NextResponse.json(
                { error: "Strategy not found" },
                { status: 404 }
            );
        }

        strategiesStore.set(userId, filteredStrategies);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting strategy:", error);
        return NextResponse.json(
            { error: "Failed to delete strategy" },
            { status: 500 }
        );
    }
}

/**
 * Common strategy templates
 */
export const STRATEGY_TEMPLATES = {
    coveredCall: {
        name: "Covered Call",
        description: "Long stock + Short call",
        legs: (symbol: string, stockPrice: number, strike: number) => [
            {
                type: "equity" as const,
                action: "buy" as const,
                symbol,
                quantity: 100,
                orderType: "market" as const,
                limitPrice: stockPrice,
            },
            {
                type: "option" as const,
                action: "sell" as const,
                symbol,
                strike,
                quantity: 1,
                orderType: "market" as const,
            },
        ],
    },
    bullCallSpread: {
        name: "Bull Call Spread",
        description: "Long lower strike call + Short higher strike call",
        legs: (symbol: string, lowerStrike: number, higherStrike: number) => [
            {
                type: "option" as const,
                action: "buy" as const,
                symbol,
                strike: lowerStrike,
                quantity: 1,
                orderType: "market" as const,
            },
            {
                type: "option" as const,
                action: "sell" as const,
                symbol,
                strike: higherStrike,
                quantity: 1,
                orderType: "market" as const,
            },
        ],
    },
    ironCondor: {
        name: "Iron Condor",
        description:
            "Short OTM put spread + Short OTM call spread for neutral outlook",
        legs: (
            symbol: string,
            putStrike1: number,
            putStrike2: number,
            callStrike1: number,
            callStrike2: number
        ) => [
            {
                type: "option" as const,
                action: "buy" as const,
                symbol,
                strike: putStrike1,
                quantity: 1,
                orderType: "market" as const,
            },
            {
                type: "option" as const,
                action: "sell" as const,
                symbol,
                strike: putStrike2,
                quantity: 1,
                orderType: "market" as const,
            },
            {
                type: "option" as const,
                action: "sell" as const,
                symbol,
                strike: callStrike1,
                quantity: 1,
                orderType: "market" as const,
            },
            {
                type: "option" as const,
                action: "buy" as const,
                symbol,
                strike: callStrike2,
                quantity: 1,
                orderType: "market" as const,
            },
        ],
    },
};

