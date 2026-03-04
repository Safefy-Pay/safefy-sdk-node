import type { ApiResponse, CurrencyType } from "./common";

export interface BalanceInfo {
    available: number;
    withdrawNowAvailable: number;
    requiresFullWithdrawalNow: boolean;
    pending: number;
    reserved: number;
    total: number;
}

export interface TotalsInfo {
    lifetimeVolume: number;
    lifetimePayouts: number;
    lifetimeRefunds: number;
}

export interface PeriodInfo {
    volumeToday: number;
    volumeThisWeek: number;
    volumeThisMonth: number;
}

export interface BalanceData {
    currency: CurrencyType | string;
    balance: BalanceInfo;
    totals: TotalsInfo;
    period: PeriodInfo;
    updatedAt: string;
}

export type GetBalanceResponse = ApiResponse<BalanceData>;
