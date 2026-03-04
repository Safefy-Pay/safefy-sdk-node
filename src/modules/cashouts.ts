import { SafefyHttpClient } from "../http-client";
import type {
    CashoutData,
    CreateCashoutRequest,
    CreateCashoutResponse,
    GetCashoutResponse,
    ListCashoutsParams,
    ListCashoutsResponse,
    PaginatedResponse,
} from "../types";

export class CashoutsModule {
    constructor(private readonly http: SafefyHttpClient) {}

    async createRaw(payload: CreateCashoutRequest): Promise<CreateCashoutResponse> {
        return this.http.request<CreateCashoutResponse>({
            method: "POST",
            path: "/v1/cashouts",
            body: payload,
        });
    }

    async create(payload: CreateCashoutRequest): Promise<CashoutData> {
        const response = await this.createRaw(payload);

        if (!response.data) {
            throw new Error("Cashout creation returned an empty payload.");
        }

        return response.data;
    }

    async listRaw(params?: ListCashoutsParams): Promise<ListCashoutsResponse> {
        return this.http.request<ListCashoutsResponse>({
            method: "GET",
            path: "/v1/cashouts",
            query: params as Record<string, unknown> | undefined,
        });
    }

    async list(params?: ListCashoutsParams): Promise<PaginatedResponse<CashoutData>> {
        const response = await this.listRaw(params);

        return {
            items: response.items ?? [],
            page: response.page ?? (params?.page ?? 1),
            pageSize: response.pageSize ?? (params?.pageSize ?? 20),
            totalItems: response.totalItems ?? 0,
            totalPages: response.totalPages ?? 0,
            hasNextPage: response.hasNextPage ?? false,
            hasPreviousPage: response.hasPreviousPage ?? false,
        };
    }

    async getRaw(cashoutId: string): Promise<GetCashoutResponse> {
        return this.http.request<GetCashoutResponse>({
            method: "GET",
            path: `/v1/cashouts/${cashoutId}`,
        });
    }

    async get(cashoutId: string): Promise<CashoutData> {
        const response = await this.getRaw(cashoutId);

        if (!response.data) {
            throw new Error("Cashout not found in API response.");
        }

        return response.data;
    }
}
