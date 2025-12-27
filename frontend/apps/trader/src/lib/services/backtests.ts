import { NextResponse } from "next/server";

export interface BacktestMetrics {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    volatility: number;
}

export interface BacktestTrade {
    entryDate: string;
    exitDate: string;
    symbol: string;
    type: "long" | "short";
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    profit: number;
    profitPercent: number;
    holdingPeriod: number; // days
}

export interface BacktestEquityCurve {
    date: string;
    equity: number;
    drawdown: number;
}

export interface BacktestResult {
    id: string;
    userId: string;
    strategyName: string;
    symbol: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
    finalEquity: number;
    metrics: BacktestMetrics;
    trades: BacktestTrade[];
    equityCurve: BacktestEquityCurve[];
    createdAt: Date;
    status: "running" | "completed" | "failed";
}

// In-memory storage for demo purposes
const backtestsStore = new Map<string, BacktestResult[]>();

/**
 * Generate mock backtest result
 */
function generateMockBacktestResult(
    userId: string,
    strategyName: string,
    symbol: string,
    startDate: string,
    endDate: string,
    initialCapital: number
): BacktestResult {
    const trades: BacktestTrade[] = [];
    const equityCurve: BacktestEquityCurve[] = [];

    let equity = initialCapital;
    const daysCount = 252; // Trading days in a year
    let maxEquity = initialCapital;
    let maxDrawdown = 0;

    let totalProfit = 0;
    let totalLoss = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let largestWin = 0;
    let largestLoss = 0;

    // Generate trades
    const numTrades = Math.floor(Math.random() * 20) + 30; // 30-50 trades
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayRange = Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < numTrades; i++) {
        const entryDayOffset = Math.floor((dayRange / numTrades) * i);
        const holdingPeriod = Math.floor(Math.random() * 10) + 1;
        const exitDayOffset = Math.min(
            entryDayOffset + holdingPeriod,
            dayRange
        );

        const entryDate = new Date(start);
        entryDate.setDate(start.getDate() + entryDayOffset);

        const exitDate = new Date(start);
        exitDate.setDate(start.getDate() + exitDayOffset);

        const entryPrice = 100 + Math.random() * 100;
        const profitPercent = (Math.random() - 0.4) * 20; // Slight bias towards profit
        const exitPrice = entryPrice * (1 + profitPercent / 100);
        const quantity = Math.floor((equity * 0.1) / entryPrice); // Use 10% of equity
        const profit = (exitPrice - entryPrice) * quantity;

        equity += profit;

        if (profit > 0) {
            winningTrades++;
            totalProfit += profit;
            largestWin = Math.max(largestWin, profit);
        } else {
            losingTrades++;
            totalLoss += Math.abs(profit);
            largestLoss = Math.min(largestLoss, profit);
        }

        trades.push({
            entryDate: entryDate.toISOString().split("T")[0],
            exitDate: exitDate.toISOString().split("T")[0],
            symbol,
            type: "long",
            entryPrice: parseFloat(entryPrice.toFixed(2)),
            exitPrice: parseFloat(exitPrice.toFixed(2)),
            quantity,
            profit: parseFloat(profit.toFixed(2)),
            profitPercent: parseFloat(profitPercent.toFixed(2)),
            holdingPeriod,
        });

        // Update equity curve
        maxEquity = Math.max(maxEquity, equity);
        const drawdown = ((maxEquity - equity) / maxEquity) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);

        equityCurve.push({
            date: exitDate.toISOString().split("T")[0],
            equity: parseFloat(equity.toFixed(2)),
            drawdown: parseFloat(drawdown.toFixed(2)),
        });
    }

    // Calculate metrics
    const totalReturn = ((equity - initialCapital) / initialCapital) * 100;
    const years = dayRange / 365;
    const annualizedReturn =
        (Math.pow(equity / initialCapital, 1 / years) - 1) * 100;
    const winRate = (winningTrades / numTrades) * 100;
    const averageWin = winningTrades > 0 ? totalProfit / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    // Simplified Sharpe ratio calculation (assuming 3% risk-free rate)
    const riskFreeRate = 3;
    const returns = trades.map((t) => t.profitPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
        returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
        returns.length;
    const volatility = Math.sqrt(variance);
    const sharpeRatio =
        volatility > 0
            ? (annualizedReturn - riskFreeRate) / (volatility * Math.sqrt(252))
            : 0;

    return {
        id: `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        strategyName,
        symbol,
        startDate,
        endDate,
        initialCapital,
        finalEquity: parseFloat(equity.toFixed(2)),
        metrics: {
            totalReturn: parseFloat(totalReturn.toFixed(2)),
            annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
            sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
            maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
            winRate: parseFloat(winRate.toFixed(2)),
            profitFactor: parseFloat(profitFactor.toFixed(2)),
            totalTrades: numTrades,
            winningTrades,
            losingTrades,
            averageWin: parseFloat(averageWin.toFixed(2)),
            averageLoss: parseFloat(averageLoss.toFixed(2)),
            largestWin: parseFloat(largestWin.toFixed(2)),
            largestLoss: parseFloat(largestLoss.toFixed(2)),
            volatility: parseFloat(volatility.toFixed(2)),
        },
        trades,
        equityCurve,
        createdAt: new Date(),
        status: "completed",
    };
}

/**
 * Get backtest result by ID
 */
export async function getBacktestResult(
    backtestId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userBacktests = backtestsStore.get(userId) || [];
        const backtest = userBacktests.find((bt) => bt.id === backtestId);

        if (!backtest) {
            // Generate a mock backtest result if not found (for demo)
            const mockBacktest = generateMockBacktestResult(
                userId,
                "Moving Average Crossover",
                "AAPL",
                "2023-01-01",
                "2024-12-31",
                100000
            );
            mockBacktest.id = backtestId;

            userBacktests.push(mockBacktest);
            backtestsStore.set(userId, userBacktests);

            return NextResponse.json({ backtest: mockBacktest });
        }

        return NextResponse.json({ backtest });
    } catch (error) {
        console.error("Error getting backtest result:", error);
        return NextResponse.json(
            { error: "Failed to fetch backtest result" },
            { status: 500 }
        );
    }
}

/**
 * Get all backtests for a user
 */
export async function getBacktests(userId: string): Promise<NextResponse> {
    try {
        const backtests = backtestsStore.get(userId) || [];
        return NextResponse.json({ backtests });
    } catch (error) {
        console.error("Error getting backtests:", error);
        return NextResponse.json(
            { error: "Failed to fetch backtests" },
            { status: 500 }
        );
    }
}

/**
 * Create a new backtest
 */
export async function createBacktest(
    userId: string,
    params: {
        strategyName: string;
        symbol: string;
        startDate: string;
        endDate: string;
        initialCapital: number;
    }
): Promise<NextResponse> {
    try {
        const backtest = generateMockBacktestResult(
            userId,
            params.strategyName,
            params.symbol,
            params.startDate,
            params.endDate,
            params.initialCapital
        );

        const userBacktests = backtestsStore.get(userId) || [];
        userBacktests.push(backtest);
        backtestsStore.set(userId, userBacktests);

        return NextResponse.json({ backtest }, { status: 201 });
    } catch (error) {
        console.error("Error creating backtest:", error);
        return NextResponse.json(
            { error: "Failed to create backtest" },
            { status: 500 }
        );
    }
}

/**
 * Delete a backtest
 */
export async function deleteBacktest(
    backtestId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userBacktests = backtestsStore.get(userId) || [];
        const filteredBacktests = userBacktests.filter(
            (bt) => bt.id !== backtestId
        );

        if (filteredBacktests.length === userBacktests.length) {
            return NextResponse.json(
                { error: "Backtest not found" },
                { status: 404 }
            );
        }

        backtestsStore.set(userId, filteredBacktests);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting backtest:", error);
        return NextResponse.json(
            { error: "Failed to delete backtest" },
            { status: 500 }
        );
    }
}

