import { SafefyHttpClient } from "../http-client";
import type {
    CreateCustomerRequest,
    CreateCustomerResponse,
    CustomerData,
    GetCustomerResponse,
    ListCustomersParams,
    ListCustomersResponse,
    PaginatedResponse,
    UpdateCustomerRequest,
    UpdateCustomerResponse,
} from "../types";

export class CustomersModule {
    constructor(private readonly http: SafefyHttpClient) {}

    async createRaw(payload: CreateCustomerRequest): Promise<CreateCustomerResponse> {
        return this.http.request<CreateCustomerResponse>({
            method: "POST",
            path: "/v1/customers",
            body: payload,
        });
    }

    async create(payload: CreateCustomerRequest): Promise<CustomerData> {
        const response = await this.createRaw(payload);

        if (!response.data) {
            throw new Error("Customer creation returned an empty payload.");
        }

        return response.data;
    }

    async listRaw(params?: ListCustomersParams): Promise<ListCustomersResponse> {
        return this.http.request<ListCustomersResponse>({
            method: "GET",
            path: "/v1/customers",
            query: params as Record<string, unknown> | undefined,
        });
    }

    async list(params?: ListCustomersParams): Promise<PaginatedResponse<CustomerData>> {
        const response = await this.listRaw(params);

        if (!response.data) {
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

        return response.data;
    }

    async getRaw(customerId: string): Promise<GetCustomerResponse> {
        return this.http.request<GetCustomerResponse>({
            method: "GET",
            path: `/v1/customers/${customerId}`,
        });
    }

    async get(customerId: string): Promise<CustomerData> {
        const response = await this.getRaw(customerId);

        if (!response.data) {
            throw new Error("Customer not found in API response.");
        }

        return response.data;
    }

    async updateRaw(customerId: string, payload: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
        return this.http.request<UpdateCustomerResponse>({
            method: "PATCH",
            path: `/v1/customers/${customerId}`,
            body: {
                id: customerId,
                ...payload,
            },
        });
    }

    async update(customerId: string, payload: UpdateCustomerRequest): Promise<CustomerData> {
        const response = await this.updateRaw(customerId, payload);

        if (!response.data) {
            throw new Error("Customer update returned an empty payload.");
        }

        return response.data;
    }
}
