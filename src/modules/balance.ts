import { SafefyHttpClient } from "../http-client";
import type { BalanceData, GetBalanceResponse } from "../types";

export class BalanceModule {
    constructor(private readonly http: SafefyHttpClient) {}

    async getRaw(): Promise<GetBalanceResponse> {
        return this.http.request<GetBalanceResponse>({
            method: "GET",
            path: "/v1/balance",
        });
    }

    async get(): Promise<BalanceData> {
        const response = await this.getRaw();

        if (!response.data) {
            throw new Error("Balance response is empty.");
        }

        return response.data;
    }
}
