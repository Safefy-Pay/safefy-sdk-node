import { SafefyHttpClient } from "../http-client";
import type {
    CreateTransactionRequest,
    CreateTransactionResponse,
    GetTransactionResponse,
    ListTransactionsParams,
    ListTransactionsResponse,
    PaginatedResponse,
    SimulateTransactionResponse,
    SimulatedTransactionData,
    TransactionData,
    TransactionDetailData,
    TransactionSimulateAction,
} from "../types";

export class TransactionsModule {
    constructor(private readonly http: SafefyHttpClient) {}

    async createRaw(payload: CreateTransactionRequest): Promise<CreateTransactionResponse> {
        return this.http.request<CreateTransactionResponse>({
            method: "POST",
            path: "/v1/transactions",
            body: {
                ...payload,
                currency: payload.currency ?? "BRL",
            },
        });
    }

    async create(payload: CreateTransactionRequest): Promise<TransactionData> {
        const response = await this.createRaw(payload);

        if (!response.data) {
            throw new Error("Transaction creation returned an empty payload.");
        }

        return response.data;
    }

    async listRaw(params?: ListTransactionsParams): Promise<ListTransactionsResponse> {
        return this.http.request<ListTransactionsResponse>({
            method: "GET",
            path: "/v1/transactions",
            query: params as Record<string, unknown> | undefined,
        });
    }

    async list(params?: ListTransactionsParams): Promise<PaginatedResponse<TransactionData>> {
        const response = await this.listRaw(params);

        if (!response.data) {
            return this.emptyPage<TransactionData>(params);
        }

        return response.data;
    }

    async getRaw(transactionId: string): Promise<GetTransactionResponse> {
        return this.http.request<GetTransactionResponse>({
            method: "GET",
            path: `/v1/transactions/${transactionId}`,
        });
    }

    async get(transactionId: string): Promise<TransactionDetailData> {
        const response = await this.getRaw(transactionId);

        if (!response.data) {
            throw new Error("Transaction not found in API response.");
        }

        return response.data;
    }

    async simulateRaw(transactionId: string, action: TransactionSimulateAction): Promise<SimulateTransactionResponse> {
        return this.http.request<SimulateTransactionResponse>({
            method: "POST",
            path: `/v1/transactions/${transactionId}/simulate`,
            body: {
                action,
            },
        });
    }

    async simulate(transactionId: string, action: TransactionSimulateAction): Promise<SimulatedTransactionData> {
        const response = await this.simulateRaw(transactionId, action);

        if (!response.data) {
            throw new Error("Simulation did not return transaction data.");
        }

        return response.data;
    }

    private emptyPage<T>(params?: { page?: number; pageSize?: number }): PaginatedResponse<T> {
        return {
            items: [],
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? 20,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        };
    }
}
