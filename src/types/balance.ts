import type { ApiResponse, CurrencyType } from "./common";

export interface BalanceInfo {
    available: number;
    withdrawNowAvailable: number;
    requiresFullWithdrawalNow: boolean;
    pending: number;
    reserved: number;
    total: number;
    /** Soma do disponível de todos os grupos de liquidação, em centavos. */
    availableTotal?: number;
    /**
     * Grupos de liquidação com saldo disponível. Cada grupo é sacado separadamente.
     * Os ids são temporários: consulte o saldo logo antes de cada saque e não guarde o id.
     */
    settlementGroups?: SettlementGroup[];
}

export interface SettlementGroup {
    /**
     * Id para enviar em `settlementGroupId` no saque. Pode mudar ou deixar de existir quando o grupo
     * zera ou a configuração da conta muda. `null`: o grupo não pode ser escolhido.
     */
    id: string | null;
    /** Disponível para saque neste grupo, em centavos. */
    available: number;
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
