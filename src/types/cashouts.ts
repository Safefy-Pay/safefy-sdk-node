import type {
    ApiEnvironment,
    ApiResponse,
    CurrencyType,
    PaginatedResponse,
    PayoutStatus,
    PixKeyType,
} from "./common";

export interface CreateCashoutRequest {
    amount: number;
    payoutAccountId?: string;
    pixKeyType?: PixKeyType;
    pixKey?: string;
    externalId?: string;
    callbackUrl?: string;
}

export interface CashoutPixData {
    pixKeyType?: PixKeyType | string;
    pixKey?: string;
    endToEndId?: string;
}

export interface CashoutData {
    id: string;
    externalId?: string;
    amount: number;
    fee: number;
    netAmount: number;
    currency: CurrencyType | string;
    status: PayoutStatus;
    environment: ApiEnvironment;
    pix: CashoutPixData;
    requestedAt: string;
    processedAt?: string;
    completedAt?: string;
    failureReason?: string;
    createdAt: string;
}

export interface ListCashoutsParams {
    status?: PayoutStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}

export type CashoutSimulateAction = "complete" | "fail" | "reject";

export interface CancelCashoutData {
    id: string;
    status: PayoutStatus;
}

export interface SimulateCashoutData {
    id: string;
    status: PayoutStatus;
}

export type CreateCashoutResponse = ApiResponse<CashoutData>;
export type ListCashoutsResponse = PaginatedResponse<CashoutData>;
export type GetCashoutResponse = ApiResponse<CashoutData>;
export type CancelCashoutResponse = ApiResponse<CancelCashoutData>;
export type SimulateCashoutResponse = ApiResponse<SimulateCashoutData>;
