import { SafefyHttpClient } from "./http-client";
import { SafefyApiError } from "./errors";
import { TransactionsModule } from "./modules/transactions";
import { CashoutsModule } from "./modules/cashouts";
import { CustomersModule } from "./modules/customers";
import { BalanceModule } from "./modules/balance";
import type { SafefyClientOptions, TokenData } from "./types";

export class SafefyPaymentSDK {
    private readonly http: SafefyHttpClient;
    private readonly authMode: "v1" | "v2";

    public readonly transactions: TransactionsModule;
    public readonly cashouts: CashoutsModule;
    public readonly customers: CustomersModule;
    public readonly balance: BalanceModule;

    constructor(options: SafefyClientOptions) {
        this.http = new SafefyHttpClient(options);
        this.authMode = options.authMode ?? "v1";
        this.transactions = new TransactionsModule(this.http);
        this.cashouts = new CashoutsModule(this.http);
        this.customers = new CustomersModule(this.http);
        this.balance = new BalanceModule(this.http);
    }

    async authenticate(forceRefresh = false): Promise<TokenData> {
        if (this.authMode === "v2") {
            throw new SafefyApiError(
                "authenticate() is not supported in v2 auth mode. Credentials are sent automatically on every request via X-Api-Key and X-Api-Secret headers.",
                400,
                "auth_mode_v2_no_token"
            );
        }

        return this.http.getToken(forceRefresh);
    }

    setAccessToken(token: string, expiresInSeconds?: number): void {
        if (this.authMode === "v2") {
            return;
        }

        this.http.setAccessToken(token, expiresInSeconds);
    }

    clearAccessToken(): void {
        if (this.authMode === "v2") {
            return;
        }

        this.http.clearToken();
    }
}

export { SafefyApiError };
