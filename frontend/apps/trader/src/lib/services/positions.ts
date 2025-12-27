import { NextResponse } from "next/server";

export interface Position {
    id: string;
    userId: string;
    symbol: string;
    type: "equity" | "option";
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    costBasis: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
    strike?: number;
    expiry?: string;
    optionType?: "call" | "put";
    openedAt: Date;
    updatedAt: Date;
}

// In-memory storage for demo purposes
const positionsStore = new Map<string, Position[]>();

/**
 * Get all positions for a user
 */
export async function getPositions(userId: string): Promise<NextResponse> {
    try {
        const positions = positionsStore.get(userId) || [];

        // Update current prices and market values (mock)
        const updatedPositions = positions.map((pos) => {
            // Simulate price movement
            const priceChange = (Math.random() - 0.5) * 10;
            const currentPrice = parseFloat(
                Math.max(pos.averagePrice + priceChange, 0.01).toFixed(2)
            );
            const marketValue = currentPrice * pos.quantity;
            const unrealizedPL = marketValue - pos.costBasis;
            const unrealizedPLPercent = (unrealizedPL / pos.costBasis) * 100;

            return {
                ...pos,
                currentPrice,
                marketValue: parseFloat(marketValue.toFixed(2)),
                unrealizedPL: parseFloat(unrealizedPL.toFixed(2)),
                unrealizedPLPercent: parseFloat(unrealizedPLPercent.toFixed(2)),
                updatedAt: new Date(),
            };
        });

        positionsStore.set(userId, updatedPositions);
        return NextResponse.json({ positions: updatedPositions });
    } catch (error) {
        console.error("Error getting positions:", error);
        return NextResponse.json(
            { error: "Failed to fetch positions" },
            { status: 500 }
        );
    }
}

/**
 * Get a single position by ID
 */
export async function getPosition(
    positionId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userPositions = positionsStore.get(userId) || [];
        const position = userPositions.find((p) => p.id === positionId);

        if (!position) {
            return NextResponse.json(
                { error: "Position not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ position });
    } catch (error) {
        console.error("Error getting position:", error);
        return NextResponse.json(
            { error: "Failed to fetch position" },
            { status: 500 }
        );
    }
}

/**
 * Close a position (sell all shares/contracts)
 */
export async function closePosition(
    positionId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userPositions = positionsStore.get(userId) || [];
        const positionIndex = userPositions.findIndex(
            (p) => p.id === positionId
        );

        if (positionIndex === -1) {
            return NextResponse.json(
                { error: "Position not found" },
                { status: 404 }
            );
        }

        const position = userPositions[positionIndex];

        // Calculate final P&L
        const marketValue = position.currentPrice * position.quantity;
        const realizedPL = marketValue - position.costBasis;

        // Remove position from store
        userPositions.splice(positionIndex, 1);
        positionsStore.set(userId, userPositions);

        return NextResponse.json({
            success: true,
            position,
            realizedPL: parseFloat(realizedPL.toFixed(2)),
        });
    } catch (error) {
        console.error("Error closing position:", error);
        return NextResponse.json(
            { error: "Failed to close position" },
            { status: 500 }
        );
    }
}

/**
 * Add a new position (typically called after order fill)
 */
export async function addPosition(
    userId: string,
    positionData: {
        symbol: string;
        type: "equity" | "option";
        quantity: number;
        averagePrice: number;
        strike?: number;
        expiry?: string;
        optionType?: "call" | "put";
    }
): Promise<NextResponse> {
    try {
        const userPositions = positionsStore.get(userId) || [];

        // Check if position already exists
        const existingPosition = userPositions.find(
            (p) =>
                p.symbol === positionData.symbol &&
                p.type === positionData.type &&
                (!positionData.strike || p.strike === positionData.strike) &&
                (!positionData.expiry || p.expiry === positionData.expiry)
        );

        if (existingPosition) {
            // Update existing position (average price calculation)
            const totalQuantity =
                existingPosition.quantity + positionData.quantity;
            const totalCost =
                existingPosition.costBasis +
                positionData.averagePrice * positionData.quantity;
            const newAveragePrice = totalCost / totalQuantity;

            existingPosition.quantity = totalQuantity;
            existingPosition.averagePrice = parseFloat(
                newAveragePrice.toFixed(2)
            );
            existingPosition.costBasis = parseFloat(totalCost.toFixed(2));
            existingPosition.currentPrice = positionData.averagePrice;
            existingPosition.marketValue = parseFloat(
                (positionData.averagePrice * totalQuantity).toFixed(2)
            );
            existingPosition.unrealizedPL = 0;
            existingPosition.unrealizedPLPercent = 0;
            existingPosition.updatedAt = new Date();

            positionsStore.set(userId, userPositions);
            return NextResponse.json({ position: existingPosition });
        }

        // Create new position
        const costBasis = positionData.averagePrice * positionData.quantity;
        const newPosition: Position = {
            id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            symbol: positionData.symbol,
            type: positionData.type,
            quantity: positionData.quantity,
            averagePrice: parseFloat(positionData.averagePrice.toFixed(2)),
            currentPrice: parseFloat(positionData.averagePrice.toFixed(2)),
            marketValue: parseFloat(costBasis.toFixed(2)),
            costBasis: parseFloat(costBasis.toFixed(2)),
            unrealizedPL: 0,
            unrealizedPLPercent: 0,
            strike: positionData.strike,
            expiry: positionData.expiry,
            optionType: positionData.optionType,
            openedAt: new Date(),
            updatedAt: new Date(),
        };

        userPositions.push(newPosition);
        positionsStore.set(userId, userPositions);

        return NextResponse.json({ position: newPosition }, { status: 201 });
    } catch (error) {
        console.error("Error adding position:", error);
        return NextResponse.json(
            { error: "Failed to add position" },
            { status: 500 }
        );
    }
}

/**
 * Calculate total portfolio metrics
 */
export function calculatePortfolioMetrics(positions: Position[]) {
    const totalMarketValue = positions.reduce(
        (sum, pos) => sum + pos.marketValue,
        0
    );
    const totalCostBasis = positions.reduce(
        (sum, pos) => sum + pos.costBasis,
        0
    );
    const totalUnrealizedPL = totalMarketValue - totalCostBasis;
    const totalUnrealizedPLPercent =
        totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0;

    return {
        totalMarketValue: parseFloat(totalMarketValue.toFixed(2)),
        totalCostBasis: parseFloat(totalCostBasis.toFixed(2)),
        totalUnrealizedPL: parseFloat(totalUnrealizedPL.toFixed(2)),
        totalUnrealizedPLPercent: parseFloat(
            totalUnrealizedPLPercent.toFixed(2)
        ),
        positionCount: positions.length,
    };
}

