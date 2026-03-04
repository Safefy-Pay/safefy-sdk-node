import { SafefyHttpClient } from "./http-client";
import { SafefyApiError } from "./errors";
import { TransactionsModule } from "./modules/transactions";
import { CashoutsModule } from "./modules/cashouts";
import { CustomersModule } from "./modules/customers";
import { BalanceModule } from "./modules/balance";
import type { SafefyClientOptions, TokenData } from "./types";

export class SafefyPaymentSDK {
    private readonly http: SafefyHttpClient;

    public readonly transactions: TransactionsModule;
    public readonly cashouts: CashoutsModule;
    public readonly customers: CustomersModule;
    public readonly balance: BalanceModule;

    constructor(options: SafefyClientOptions) {
        this.http = new SafefyHttpClient(options);
        this.transactions = new TransactionsModule(this.http);
        this.cashouts = new CashoutsModule(this.http);
        this.customers = new CustomersModule(this.http);
        this.balance = new BalanceModule(this.http);
    }

    async authenticate(forceRefresh = false): Promise<TokenData> {
        return this.http.getToken(forceRefresh);
    }

    setAccessToken(token: string, expiresInSeconds?: number): void {
        this.http.setAccessToken(token, expiresInSeconds);
    }

    clearAccessToken(): void {
        this.http.clearToken();
    }
}

export { SafefyApiError };
