export interface Product {
    id: string; // UUID
    name: string;
    category: 'FEED' | 'MEDICINE' | 'LIVE_CHICK' | 'MEAT' | 'EGGS' | 'OTHER';
    unit?: string;
    costPrice: number;
    sellingPrice: number;
    currentStock: number;
}

export interface Customer {
    id: string; // UUID
    name: string;
    phone?: string;
    email?: string;
    customerType: 'RETAIL' | 'WHOLESALE' | 'FARMER';
    currentTotalBalance: number;
    creditLimit?: number;
}

export interface DashboardStats {
    revenue: KpiStat;
    profit: KpiStat;
    stockValue: KpiStat;
    credits: KpiStat;
}

export interface KpiStat {
    value: number;
    change: number; // Percentage
    trend: TrendPoint[];
}

export interface TrendPoint {
    date?: string;
    label?: string;
    value: number;
}

export interface RevenueExpenseDay {
    day: string;
    revenue: number;
    expense: number;
}

export interface StockMovement {
    day: string;
    sales_count: number;
    purchases_count: number;
}

export interface LowStockAlert {
    name: string;
    current_stock: number; // Matching Backend Map key
    unit?: string;
}

export interface AgingCredit {
    customer_id: string;
    name: string;
    current_balance: number;
    due_date: string;
}
