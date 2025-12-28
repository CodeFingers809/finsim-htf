import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currency?: string): string {
    const symbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
        INR: "₹",
        CNY: "¥",
        AUD: "A$",
        CAD: "C$",
        CHF: "Fr",
        HKD: "HK$",
        SGD: "S$",
    };
    return symbols[currency?.toUpperCase() || "USD"] || currency || "$";
}

