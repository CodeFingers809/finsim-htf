"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Plus,
    X,
    Play,
    Zap,
    Shield,
    Target,
    BarChart3,
    Percent,
    Activity,
    Layers,
    AlertTriangle,
    CheckCircle,
    Lightbulb,
    Link2,
    ArrowDownRight,
    Sparkles,
    Crown,
    Scale,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminalLayout } from "@/components/layout/terminal-layout";
import { Badge } from "@/components/ui/badge";
import { StockSearch } from "@/components/ui/stock-search";
import { cn } from "@/lib/utils/cn";
import type {
    OptimizeResponse,
    PortfolioStrategy,
    Recommendation,
} from "@/app/api/optimize/route";

const STOCK_SUGGESTIONS = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
];

const STRATEGY_INFO = {
    min_risk: {
        name: "Minimum Risk",
        description: "Minimizes portfolio volatility for stability",
        icon: Shield,
        color: "#3dd68c",
        bgColor: "#3dd68c/10",
        borderColor: "#3dd68c/30",
    },
    max_sharpe: {
        name: "Max Sharpe",
        description: "Maximizes risk-adjusted returns (diversified)",
        icon: Target,
        color: "#6c8cff",
        bgColor: "#6c8cff/10",
        borderColor: "#6c8cff/30",
    },
    hrp: {
        name: "HRP",
        description: "Hierarchical Risk Parity clustering",
        icon: Layers,
        color: "#f0b86c",
        bgColor: "#f0b86c/10",
        borderColor: "#f0b86c/30",
    },
    kelly: {
        name: "Half Kelly",
        description: "Fractional Kelly Criterion (safer growth)",
        icon: Zap,
        color: "#c96cff",
        bgColor: "#c96cff/10",
        borderColor: "#c96cff/30",
    },
};

type StrategyKey = keyof typeof STRATEGY_INFO;

function RecommendationCard({
    recommendation,
}: {
    recommendation: Recommendation;
}) {
    const iconMap = {
        strategy: {
            icon: Sparkles,
            color: "#6c8cff",
            bgColor: "bg-[#6c8cff]/10",
            borderColor: "border-[#6c8cff]/30",
        },
        warning: {
            icon: AlertTriangle,
            color: "#f0b86c",
            bgColor: "bg-[#f0b86c]/10",
            borderColor: "border-[#f0b86c]/30",
        },
        positive: {
            icon: CheckCircle,
            color: "#3dd68c",
            bgColor: "bg-[#3dd68c]/10",
            borderColor: "border-[#3dd68c]/30",
        },
        insight: {
            icon: Lightbulb,
            color: "#c96cff",
            bgColor: "bg-[#c96cff]/10",
            borderColor: "border-[#c96cff]/30",
        },
    };

    const config = iconMap[recommendation.type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "p-3 rounded-xl border",
                config.bgColor,
                config.borderColor
            )}
        >
            <div className="flex items-start gap-2">
                <Icon
                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                    style={{ color: config.color }}
                />
                <div>
                    <p className="text-xs font-medium text-[#e8eaed] mb-1">
                        {recommendation.title}
                    </p>
                    <p className="text-[10px] text-[#8b8f9a] leading-relaxed">
                        {recommendation.description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function OptimizeClient() {
    const [tickers, setTickers] = useState<string[]>([
        "RELIANCE.NS",
        "TCS.NS",
        "INFY.NS",
    ]);
    const [capital, setCapital] = useState(100000);
    const [newSymbol, setNewSymbol] = useState("");
    const [result, setResult] = useState<OptimizeResponse | null>(null);
    const [selectedStrategy, setSelectedStrategy] =
        useState<StrategyKey>("max_sharpe");

    const mutation = useMutation({
        mutationFn: async () => {
            const response = await fetch("/api/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tickers,
                    capital,
                }),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || "Optimization failed");
            }
            return response.json();
        },
        onSuccess: (payload: OptimizeResponse) => {
            setResult(payload);
            toast.success("Portfolio optimized successfully!");
        },
        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to optimize portfolio"
            );
        },
    });

    const handleSubmit = () => {
        if (tickers.length < 2 || mutation.isPending) return;
        mutation.mutate();
    };

    const addSymbol = (symbol?: string) => {
        const sym = (symbol || newSymbol).trim().toUpperCase();
        if (sym && !tickers.includes(sym)) {
            setTickers([...tickers, sym]);
            setNewSymbol("");
        }
    };

    const removeSymbol = (symbolToRemove: string) => {
        setTickers(tickers.filter((s) => s !== symbolToRemove));
    };

    const addSuggestedStock = (symbol: string) => {
        if (!tickers.includes(symbol)) {
            setTickers([...tickers, symbol]);
        }
    };

    const formatPercent = (value: number) => {
        const pct = value * 100;
        return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    };

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
        })}`;
    };

    const currentPortfolio = result?.portfolios[selectedStrategy];

    return (
        <TerminalLayout
            title={
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24] border border-[#2d303a]/40">
                    <PieChart className="h-3.5 w-3.5 text-[#6c8cff]" />
                    <span className="text-xs text-[#8b8f9a]">
                        Portfolio Optimization
                    </span>
                </div>
            }
            centerContent={
                result && currentPortfolio ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1d24]/80 border border-[#2d303a]/40">
                            <TrendingUp className="h-4 w-4 text-[#6c8cff]" />
                            <span className="text-xs text-[#8b8f9a]">
                                Expected Return
                            </span>
                            <span
                                className={cn(
                                    "text-lg font-bold font-mono",
                                    currentPortfolio.metrics.return >= 0
                                        ? "text-[#3dd68c]"
                                        : "text-[#f06c6c]"
                                )}
                            >
                                {formatPercent(currentPortfolio.metrics.return)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24]/60 border border-[#2d303a]/30">
                            <span className="text-xs text-[#8b8f9a]">
                                Sharpe
                            </span>
                            <span className="text-sm font-semibold text-[#e8eaed]">
                                {currentPortfolio?.metrics?.sharpe?.toFixed(
                                    2
                                ) ?? "--"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24]/60 border border-[#2d303a]/30">
                        <DollarSign className="h-3.5 w-3.5 text-[#8b8f9a]" />
                        <span className="text-xs text-[#8b8f9a]">Capital:</span>
                        <span className="text-sm font-medium text-[#e8eaed]">
                            ₹{capital.toLocaleString("en-IN")}
                        </span>
                        <Badge
                            variant="outline"
                            className="text-[10px] bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                        >
                            {tickers.length} stocks
                        </Badge>
                    </div>
                )
            }
        >
            <div className="flex-1 flex flex-col bg-[#0c0d10] overflow-hidden">
                {/* Input Form */}
                {!result && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="min-h-full flex items-center justify-center p-6">
                            <div className="w-full max-w-xl my-auto">
                                <div className="rounded-2xl bg-[#12141a] border border-[#2d303a]/50 p-6 shadow-xl">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c8cff]/10 border border-[#6c8cff]/20 mb-4">
                                            <PieChart className="h-6 w-6 text-[#6c8cff]" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-2">
                                            Portfolio Optimization
                                        </h2>
                                        <p className="text-sm text-[#8b8f9a]">
                                            Select stocks and capital to
                                            optimize your portfolio allocation
                                        </p>
                                    </div>

                                    {/* Stock Selection */}
                                    <div className="space-y-4 mb-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-medium text-[#8b8f9a]">
                                                <Target className="h-3.5 w-3.5" />
                                                Stocks to Optimize (min. 2)
                                            </label>

                                            {/* Stock Search with Selected Badges */}
                                            <StockSearch
                                                onSelect={addSymbol}
                                                placeholder="Search and add stocks (e.g., RELIANCE.NS)"
                                                selectedStocks={tickers}
                                                showSelectedBadges={true}
                                                onRemove={removeSymbol}
                                            />

                                            {/* Stock Suggestions */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {STOCK_SUGGESTIONS.filter(
                                                    (s) => !tickers.includes(s)
                                                ).map((symbol) => (
                                                    <button
                                                        key={symbol}
                                                        onClick={() =>
                                                            addSuggestedStock(
                                                                symbol
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#8b8f9a] bg-[#1a1d24] border border-[#2d303a]/50 rounded-lg hover:border-[#6c8cff]/50 hover:text-[#e8eaed] transition-colors"
                                                    >
                                                        <Zap className="h-3 w-3 text-[#6c8cff]" />
                                                        {symbol}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Capital Input */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-medium text-[#8b8f9a]">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Investment Capital
                                            </label>
                                            <Input
                                                type="number"
                                                value={capital}
                                                onChange={(e) =>
                                                    setCapital(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="h-10 text-sm bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed] focus:border-[#6c8cff] focus:ring-1 focus:ring-[#6c8cff]/20"
                                                placeholder="Enter capital"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                {[
                                                    50000, 100000, 500000,
                                                    1000000,
                                                ].map((amt) => (
                                                    <button
                                                        key={amt}
                                                        onClick={() =>
                                                            setCapital(amt)
                                                        }
                                                        className={cn(
                                                            "flex-1 py-1.5 text-xs rounded-lg border transition-colors",
                                                            capital === amt
                                                                ? "bg-[#6c8cff] border-[#6c8cff] text-white"
                                                                : "bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a] hover:border-[#6c8cff]/50 hover:text-[#e8eaed]"
                                                        )}
                                                    >
                                                        ₹
                                                        {amt >= 100000
                                                            ? `${amt / 100000}L`
                                                            : `${amt / 1000}K`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategy Preview */}
                                    <div className="mb-6 p-4 rounded-xl bg-[#0c0d10] border border-[#2d303a]/30">
                                        <p className="text-xs text-[#8b8f9a] mb-3">
                                            Strategies that will be calculated:
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(STRATEGY_INFO).map(
                                                ([key, info]) => {
                                                    const Icon = info.icon;
                                                    return (
                                                        <div
                                                            key={key}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1d24] border border-[#2d303a]/50"
                                                        >
                                                            <Icon
                                                                className="h-3.5 w-3.5"
                                                                style={{
                                                                    color: info.color,
                                                                }}
                                                            />
                                                            <span className="text-xs text-[#e8eaed]">
                                                                {info.name}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={
                                            tickers.length < 2 ||
                                            mutation.isPending
                                        }
                                        className="w-full h-12 text-sm font-medium bg-[#6c8cff] hover:bg-[#5c7ce8] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-2">
                                            {mutation.isPending ? (
                                                <>
                                                    <Activity className="h-4 w-4 animate-pulse" />
                                                    <span>Optimizing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4" />
                                                    <span>
                                                        Optimize Portfolio
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </Button>

                                    <p className="text-[10px] text-center text-[#8b8f9a] mt-4">
                                        Uses Mean-Variance, HRP, and Kelly
                                        optimization on 2 years of historical
                                        data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Area */}
                {result && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="max-w-6xl mx-auto px-6 py-6">
                            {/* Header with Reset */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className="bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                    >
                                        <Target className="h-3 w-3 mr-1" />
                                        {
                                            result.input.valid_tickers_found
                                                .length
                                        }{" "}
                                        stocks
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                    >
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        {formatCurrency(result.input.capital)}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a]"
                                    >
                                        <Activity className="h-3 w-3 mr-1" />
                                        {
                                            result.input.trading_days_analyzed
                                        }{" "}
                                        trading days
                                    </Badge>
                                </div>
                                <Button
                                    onClick={() => setResult(null)}
                                    variant="outline"
                                    className="h-9 px-4 text-xs bg-[#1a1d24] border-[#2d303a]/50 text-[#e8eaed] hover:bg-[#252730] hover:border-[#6c8cff]/50"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-2" />
                                    New Optimization
                                </Button>
                            </div>

                            {/* Recommendations Section */}
                            {result.recommendations &&
                                result.recommendations.length > 0 && (
                                    <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {result.recommendations.map(
                                            (rec, idx) => (
                                                <RecommendationCard
                                                    key={idx}
                                                    recommendation={rec}
                                                />
                                            )
                                        )}
                                    </div>
                                )}

                            {/* Strategy Selector */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {(
                                    Object.entries(STRATEGY_INFO) as [
                                        StrategyKey,
                                        (typeof STRATEGY_INFO)[StrategyKey]
                                    ][]
                                ).map(([key, info]) => {
                                    const Icon = info.icon;
                                    const portfolio = result.portfolios[key];
                                    const isSelected = selectedStrategy === key;
                                    const isBestSharpe =
                                        result.strategy_comparison
                                            ?.best_sharpe === key;
                                    const isLowestRisk =
                                        result.strategy_comparison
                                            ?.lowest_risk === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() =>
                                                setSelectedStrategy(key)
                                            }
                                            className={cn(
                                                "p-4 rounded-xl border transition-all duration-200 text-left relative",
                                                isSelected
                                                    ? "bg-[#1a1d24] border-[#6c8cff] shadow-lg"
                                                    : "bg-[#12141a] border-[#2d303a]/50 hover:border-[#6c8cff]/50"
                                            )}
                                        >
                                            {/* Best strategy badges */}
                                            <div className="absolute -top-2 -right-2 flex gap-1">
                                                {isBestSharpe && (
                                                    <span className="px-1.5 py-0.5 text-[9px] font-medium bg-[#3dd68c] text-black rounded-full flex items-center gap-0.5">
                                                        <Crown className="h-2.5 w-2.5" />{" "}
                                                        Best
                                                    </span>
                                                )}
                                                {isLowestRisk &&
                                                    !isBestSharpe && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-[#6c8cff] text-white rounded-full flex items-center gap-0.5">
                                                            <Shield className="h-2.5 w-2.5" />{" "}
                                                            Safest
                                                        </span>
                                                    )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon
                                                    className="h-4 w-4"
                                                    style={{
                                                        color: info.color,
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-[#e8eaed]">
                                                    {info.name}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#8b8f9a] mb-3">
                                                {info.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-[#8b8f9a]">
                                                    Return
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-sm font-semibold",
                                                        portfolio.metrics
                                                            .return >= 0
                                                            ? "text-[#3dd68c]"
                                                            : "text-[#f06c6c]"
                                                    )}
                                                >
                                                    {formatPercent(
                                                        portfolio.metrics.return
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-[#8b8f9a]">
                                                    Sharpe
                                                </span>
                                                <span className="text-sm font-semibold text-[#e8eaed]">
                                                    {portfolio?.metrics?.sharpe?.toFixed(
                                                        2
                                                    ) ?? "--"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-[#8b8f9a]">
                                                    Max DD
                                                </span>
                                                <span className="text-sm font-semibold text-[#f06c6c]">
                                                    {formatPercent(
                                                        portfolio.metrics
                                                            .max_drawdown
                                                    )}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selected Strategy Details */}
                            {currentPortfolio && (
                                <div className="grid grid-cols-3 gap-6">
                                    {/* Metrics Card */}
                                    <div className="rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                        <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-[#6c8cff]" />
                                            Portfolio Metrics
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-[#3dd68c]" />
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        Expected Return
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "text-lg font-bold",
                                                        currentPortfolio.metrics
                                                            .return >= 0
                                                            ? "text-[#3dd68c]"
                                                            : "text-[#f06c6c]"
                                                    )}
                                                >
                                                    {formatPercent(
                                                        currentPortfolio.metrics
                                                            .return
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-[#f0b86c]" />
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        Volatility
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-[#f0b86c]">
                                                    {formatPercent(
                                                        currentPortfolio.metrics
                                                            .volatility
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-[#6c8cff]" />
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        Sharpe Ratio
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-[#6c8cff]">
                                                    {currentPortfolio?.metrics?.sharpe?.toFixed(
                                                        2
                                                    ) ?? "--"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center gap-2">
                                                    <ArrowDownRight className="h-4 w-4 text-[#f06c6c]" />
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        Max Drawdown
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-[#f06c6c]">
                                                    {formatPercent(
                                                        currentPortfolio.metrics
                                                            .max_drawdown
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Analysis Card */}
                                    <div className="rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                        <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-[#6c8cff]" />
                                            Risk Analysis
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        VaR (95%)
                                                    </span>
                                                    <span className="text-sm font-semibold text-[#f06c6c]">
                                                        {formatPercent(
                                                            currentPortfolio
                                                                .metrics.var_95
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#8b8f9a]">
                                                    95% chance daily loss
                                                    won&apos;t exceed this
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        CVaR (95%)
                                                    </span>
                                                    <span className="text-sm font-semibold text-[#f06c6c]">
                                                        {formatPercent(
                                                            currentPortfolio
                                                                .metrics.cvar_95
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#8b8f9a]">
                                                    Expected loss in worst 5%
                                                    scenarios
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        Diversification Ratio
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-sm font-semibold",
                                                            currentPortfolio
                                                                .metrics
                                                                .diversification_ratio >
                                                                1.2
                                                                ? "text-[#3dd68c]"
                                                                : "text-[#f0b86c]"
                                                        )}
                                                    >
                                                        {currentPortfolio?.metrics?.diversification_ratio?.toFixed(
                                                            2
                                                        ) ?? "--"}
                                                        x
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#8b8f9a]">
                                                    {currentPortfolio.metrics
                                                        .diversification_ratio >
                                                    1.2
                                                        ? "Good diversification benefits"
                                                        : "Limited diversification"}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-[#1a1d24]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-[#8b8f9a]">
                                                        Effective # of Assets
                                                    </span>
                                                    <span className="text-sm font-semibold text-[#e8eaed]">
                                                        {currentPortfolio?.metrics?.effective_assets?.toFixed(
                                                            1
                                                        ) ?? "--"}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#8b8f9a]">
                                                    {currentPortfolio.insights
                                                        .is_concentrated
                                                        ? "Concentrated portfolio"
                                                        : "Well-spread allocation"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Allocation Card */}
                                    <div className="rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                        <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-[#6c8cff]" />
                                            Capital Allocation
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                currentPortfolio.allocation
                                            )
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([ticker, amount]) => {
                                                    const isTopHolding =
                                                        ticker ===
                                                        currentPortfolio
                                                            .insights
                                                            .top_holding.ticker;
                                                    return (
                                                        <div
                                                            key={ticker}
                                                            className={cn(
                                                                "flex items-center justify-between p-2 rounded-lg",
                                                                isTopHolding
                                                                    ? "bg-[#6c8cff]/10 border border-[#6c8cff]/30"
                                                                    : "bg-[#1a1d24]"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isTopHolding && (
                                                                    <Crown className="h-3 w-3 text-[#6c8cff]" />
                                                                )}
                                                                <span className="text-xs text-[#e8eaed]">
                                                                    {ticker}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-[#3dd68c]">
                                                                {formatCurrency(
                                                                    amount
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-[#2d303a]/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-[#8b8f9a]">
                                                    Total
                                                </span>
                                                <span className="text-sm font-bold text-[#e8eaed]">
                                                    {formatCurrency(
                                                        result.input.capital
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Weights and Risk Contribution Row */}
                            {currentPortfolio && (
                                <div className="mt-6 grid grid-cols-2 gap-6">
                                    {/* Weights Card */}
                                    <div className="rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                        <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                            <Percent className="h-4 w-4 text-[#6c8cff]" />
                                            Optimal Weights
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                currentPortfolio.weights
                                            )
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([ticker, weight]) => (
                                                    <div
                                                        key={ticker}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <span className="text-xs text-[#e8eaed] w-28 truncate">
                                                            {ticker}
                                                        </span>
                                                        <div className="flex-1 h-2 bg-[#1a1d24] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#6c8cff] rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${
                                                                        weight *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-[#8b8f9a] w-14 text-right">
                                                            {(
                                                                weight * 100
                                                            ).toFixed(1)}
                                                            %
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Risk Contribution Card */}
                                    <div className="rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                        <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-[#f0b86c]" />
                                            Risk Contribution
                                        </h3>
                                        <div className="space-y-2">
                                            {currentPortfolio.risk_contribution &&
                                                Object.entries(
                                                    currentPortfolio.risk_contribution
                                                )
                                                    .sort((a, b) => b[1] - a[1])
                                                    .map(
                                                        ([
                                                            ticker,
                                                            riskContrib,
                                                        ]) => (
                                                            <div
                                                                key={ticker}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <span className="text-xs text-[#e8eaed] w-28 truncate">
                                                                    {ticker}
                                                                </span>
                                                                <div className="flex-1 h-2 bg-[#1a1d24] rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-[#f0b86c] rounded-full transition-all duration-500"
                                                                        style={{
                                                                            width: `${
                                                                                riskContrib *
                                                                                100
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-[#8b8f9a] w-14 text-right">
                                                                    {(
                                                                        riskContrib *
                                                                        100
                                                                    ).toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                        </div>
                                        <p className="mt-3 text-[10px] text-[#8b8f9a]">
                                            How much each asset contributes to
                                            total portfolio risk
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Individual Asset Metrics */}
                            <div className="mt-6 rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-[#6c8cff]" />
                                    Individual Asset Performance
                                    {result.asset_insights && (
                                        <span className="ml-auto flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-[#3dd68c]/10 border-[#3dd68c]/30 text-[#3dd68c] text-[10px]"
                                            >
                                                <Crown className="h-2.5 w-2.5 mr-1" />
                                                Best:{" "}
                                                {
                                                    result.asset_insights
                                                        .best_sharpe.ticker
                                                }
                                            </Badge>
                                        </span>
                                    )}
                                </h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {Object.entries(result.assets).map(
                                        ([ticker, metrics]) => {
                                            const isBestReturn =
                                                result.asset_insights
                                                    ?.best_return.ticker ===
                                                ticker;
                                            const isBestSharpe =
                                                result.asset_insights
                                                    ?.best_sharpe.ticker ===
                                                ticker;
                                            const isLowestVol =
                                                result.asset_insights
                                                    ?.lowest_volatility
                                                    .ticker === ticker;
                                            return (
                                                <div
                                                    key={ticker}
                                                    className={cn(
                                                        "p-3 rounded-lg border",
                                                        isBestSharpe
                                                            ? "bg-[#3dd68c]/5 border-[#3dd68c]/30"
                                                            : "bg-[#1a1d24] border-[#2d303a]/30"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-[#e8eaed]">
                                                            {ticker}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {isBestReturn && (
                                                                <span className="text-[8px] px-1.5 py-0.5 bg-[#3dd68c]/20 text-[#3dd68c] rounded">
                                                                    TOP RETURN
                                                                </span>
                                                            )}
                                                            {isBestSharpe && (
                                                                <span className="text-[8px] px-1.5 py-0.5 bg-[#6c8cff]/20 text-[#6c8cff] rounded">
                                                                    BEST SHARPE
                                                                </span>
                                                            )}
                                                            {isLowestVol && (
                                                                <span className="text-[8px] px-1.5 py-0.5 bg-[#c96cff]/20 text-[#c96cff] rounded">
                                                                    STABLE
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-[#8b8f9a]">
                                                            Return
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "font-semibold",
                                                                metrics.return >=
                                                                    0
                                                                    ? "text-[#3dd68c]"
                                                                    : "text-[#f06c6c]"
                                                            )}
                                                        >
                                                            {formatPercent(
                                                                metrics.return
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs mt-1">
                                                        <span className="text-[#8b8f9a]">
                                                            Volatility
                                                        </span>
                                                        <span className="font-semibold text-[#f0b86c]">
                                                            {formatPercent(
                                                                metrics.volatility
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs mt-1">
                                                        <span className="text-[#8b8f9a]">
                                                            Sharpe
                                                        </span>
                                                        <span className="font-semibold text-[#6c8cff]">
                                                            {metrics?.sharpe?.toFixed(
                                                                2
                                                            ) ?? "--"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            {/* Correlation Insights */}
                            {result.correlation_insights && (
                                <div className="mt-6 rounded-xl bg-[#12141a] border border-[#2d303a]/50 p-5">
                                    <h3 className="text-sm font-medium text-[#e8eaed] mb-4 flex items-center gap-2">
                                        <Link2 className="h-4 w-4 text-[#6c8cff]" />
                                        Correlation Insights
                                        <Badge
                                            variant="outline"
                                            className="ml-auto bg-[#1a1d24] border-[#2d303a]/50 text-[#8b8f9a] text-[10px]"
                                        >
                                            Avg:{" "}
                                            {(
                                                result.correlation_insights
                                                    .avg_correlation * 100
                                            ).toFixed(0)}
                                            %
                                        </Badge>
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-[#8b8f9a] mb-2 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-[#3dd68c]" />
                                                Least Correlated (Best for
                                                Diversification)
                                            </p>
                                            <div className="space-y-2">
                                                {result.correlation_insights.least_correlated.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-2 rounded-lg bg-[#1a1d24]"
                                                        >
                                                            <span className="text-xs text-[#e8eaed]">
                                                                {item.pair[0]} ↔{" "}
                                                                {item.pair[1]}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    "text-xs font-semibold",
                                                                    item.correlation <
                                                                        0.3
                                                                        ? "text-[#3dd68c]"
                                                                        : "text-[#f0b86c]"
                                                                )}
                                                            >
                                                                {(
                                                                    item.correlation *
                                                                    100
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#8b8f9a] mb-2 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3 text-[#f0b86c]" />
                                                Most Correlated (Move Together)
                                            </p>
                                            <div className="space-y-2">
                                                {result.correlation_insights.most_correlated.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-2 rounded-lg bg-[#1a1d24]"
                                                        >
                                                            <span className="text-xs text-[#e8eaed]">
                                                                {item.pair[0]} ↔{" "}
                                                                {item.pair[1]}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    "text-xs font-semibold",
                                                                    item.correlation >
                                                                        0.7
                                                                        ? "text-[#f06c6c]"
                                                                        : "text-[#f0b86c]"
                                                                )}
                                                            >
                                                                {(
                                                                    item.correlation *
                                                                    100
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 143, 154, 0.2);
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 143, 154, 0.35);
                }
                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: transparent;
                }
            `}</style>
        </TerminalLayout>
    );
}

