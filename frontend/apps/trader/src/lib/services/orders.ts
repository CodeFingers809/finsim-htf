import { NextResponse } from "next/server";

export interface OrderLeg {
    type: "equity" | "option";
    action: "buy" | "sell";
    symbol: string;
    strike?: number;
    expiry?: string;
    quantity: number;
    orderType: "market" | "limit";
    limitPrice?: number;
}

export interface Order {
    id: string;
    userId: string;
    strategyId?: string;
    legs: OrderLeg[];
    status: "pending" | "filled" | "rejected" | "cancelled";
    totalCost: number;
    commission: number;
    createdAt: Date;
    filledAt?: Date;
}

// In-memory storage for demo purposes
const ordersStore = new Map<string, Order[]>();

/**
 * Simulate order placement
 */
export async function simulateOrderPlacement(
    userId: string,
    orderData: {
        strategyId?: string;
        legs: OrderLeg[];
    }
): Promise<NextResponse> {
    try {
        // Calculate total cost and commission
        let totalCost = 0;
        const commission = 0.65 * orderData.legs.length; // $0.65 per leg

        for (const leg of orderData.legs) {
            let legCost = 0;

            if (leg.type === "equity") {
                // For equity, use limit price if available, otherwise estimate
                const price = leg.limitPrice || 100; // Mock price
                legCost = price * leg.quantity;
            } else {
                // For options
                const optionPrice = leg.limitPrice || 5; // Mock option price
                legCost = optionPrice * leg.quantity * 100; // Options are in contracts of 100
            }

            // Subtract cost for sells, add for buys
            if (leg.action === "buy") {
                totalCost += legCost;
            } else {
                totalCost -= legCost;
            }
        }

        totalCost += commission;

        // Create the order
        const order: Order = {
            id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            strategyId: orderData.strategyId,
            legs: orderData.legs,
            status: "filled", // Simulate instant fill
            totalCost: parseFloat(totalCost.toFixed(2)),
            commission,
            createdAt: new Date(),
            filledAt: new Date(),
        };

        // Store the order
        const userOrders = ordersStore.get(userId) || [];
        userOrders.push(order);
        ordersStore.set(userId, userOrders);

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        console.error("Error simulating order:", error);
        return NextResponse.json(
            { error: "Failed to simulate order placement" },
            { status: 500 }
        );
    }
}

/**
 * Get all orders for a user
 */
export async function getOrders(userId: string): Promise<NextResponse> {
    try {
        const orders = ordersStore.get(userId) || [];
        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Error getting orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

/**
 * Get a single order by ID
 */
export async function getOrder(
    orderId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userOrders = ordersStore.get(userId) || [];
        const order = userOrders.find((o) => o.id === orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error("Error getting order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order" },
            { status: 500 }
        );
    }
}

/**
 * Cancel an order (if still pending)
 */
export async function cancelOrder(
    orderId: string,
    userId: string
): Promise<NextResponse> {
    try {
        const userOrders = ordersStore.get(userId) || [];
        const order = userOrders.find((o) => o.id === orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (order.status !== "pending") {
            return NextResponse.json(
                { error: "Cannot cancel order that is not pending" },
                { status: 400 }
            );
        }

        order.status = "cancelled";
        ordersStore.set(userId, userOrders);

        return NextResponse.json({ order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return NextResponse.json(
            { error: "Failed to cancel order" },
            { status: 500 }
        );
    }
}

/**
 * Calculate estimated order cost (for preview before placing)
 */
export function calculateOrderCost(legs: OrderLeg[]): number {
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
    return parseFloat(totalCost.toFixed(2));
}

