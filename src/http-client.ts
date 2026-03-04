import { SAFEFY_PAYMENT_API_BASE_URL } from "./constants";
import { SafefyApiError } from "./errors";
import { SafefyLogger } from "./logger";
import type {
    SafefyClientOptions,
    TokenData,
    TokenResponse,
} from "./types";

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH";
    path: string;
    body?: unknown;
    query?: Record<string, unknown> | undefined;
    auth?: boolean;
}

export class SafefyHttpClient {
    private readonly baseUrl: string;
    private readonly publicKey: string;
    private readonly secretKey: string;
    private readonly timeoutMs: number;
    private readonly tokenRefreshBufferMs: number;
    private readonly fetchFn: typeof fetch;
    private readonly defaultHeaders: Record<string, string>;
    private readonly logger: SafefyLogger;

    private accessToken: string | undefined;
    private tokenData: TokenData | undefined;
    private tokenExpiresAt = 0;
    private pendingTokenPromise: Promise<TokenData> | undefined;

    constructor(options: SafefyClientOptions) {
        this.baseUrl = SAFEFY_PAYMENT_API_BASE_URL;
        this.publicKey = options.publicKey;
        this.secretKey = options.secretKey;
        this.timeoutMs = options.timeoutMs ?? 30000;
        this.tokenRefreshBufferMs = options.tokenRefreshBufferMs ?? 30000;
        this.fetchFn = options.fetchFn ?? fetch;
        this.defaultHeaders = options.defaultHeaders ?? {};
        this.logger = new SafefyLogger(options.log);

        this.logger.log({
            level: "info",
            event: "sdk.init",
            message: "Safefy SDK initialized.",
            meta: {
                timeoutMs: this.timeoutMs,
                tokenRefreshBufferMs: this.tokenRefreshBufferMs,
            },
        });
    }

    public async request<T>(options: RequestOptions): Promise<T> {
        const method = options.method ?? "GET";
        const auth = options.auth ?? true;
        const url = this.buildUrl(options.path, options.query);

        const headers: Record<string, string> = {
            Accept: "application/json",
            ...this.defaultHeaders,
        };

        if (options.body !== undefined) {
            headers["Content-Type"] = "application/json";
        }

        if (auth) {
            const token = await this.getAccessToken();
            headers.Authorization = `Bearer ${token}`;
        }

        const payload = options.body !== undefined ? JSON.stringify(options.body) : undefined;
        const requestInit: RequestInit = {
            method,
            headers,
        };

        if (payload !== undefined) {
            requestInit.body = payload;
        }

        this.logger.log({
            level: "debug",
            event: "http.request",
            message: `${method} ${options.path}`,
            meta: {
                url,
                headers: this.logger.shouldIncludeHeaders() ? this.sanitize(headers) : undefined,
                body: this.logger.shouldIncludeBody() ? this.safeJsonParse(payload) : undefined,
                query: options.query,
            },
        });

        const startedAt = Date.now();

        try {
            const response = await this.fetchWithTimeout(url, requestInit);
            const isJson = (response.headers.get("content-type") ?? "").includes("application/json");
            const body = isJson ? await response.json() : null;
            const durationMs = Date.now() - startedAt;

            if (!response.ok) {
                const errorMessage = this.extractErrorMessage(body) ?? `Request failed with status ${response.status}.`;
                const errorCode = this.extractErrorCode(body);

                this.logger.log({
                    level: "error",
                    event: "http.response.error",
                    message: `${method} ${options.path} failed`,
                    status: response.status,
                    durationMs,
                    meta: this.sanitize(body),
                });

                throw new SafefyApiError(errorMessage, response.status, errorCode, body);
            }

            if (body && typeof body === "object" && "error" in body && body.error) {
                const error = body.error as { message?: string; code?: string };

                this.logger.log({
                    level: "error",
                    event: "http.response.api_error",
                    message: `${method} ${options.path} returned API error payload`,
                    status: response.status,
                    durationMs,
                    meta: this.sanitize(body),
                });

                throw new SafefyApiError(error.message ?? "Request returned an API error.", response.status, error.code, body);
            }

            this.logger.log({
                level: "info",
                event: "http.response.success",
                message: `${method} ${options.path} succeeded`,
                status: response.status,
                durationMs,
                meta: this.summarizeSuccessResponse(body),
            });

            return body as T;
        } catch (error) {
            if (error instanceof SafefyApiError) {
                throw error;
            }

            const durationMs = Date.now() - startedAt;
            this.logger.log({
                level: "error",
                event: "http.request.exception",
                message: `${method} ${options.path} threw exception`,
                durationMs,
                meta: {
                    error: error instanceof Error ? error.message : String(error),
                },
            });

            throw error;
        }
    }

    public async getToken(forceRefresh = false): Promise<TokenData> {
        if (!forceRefresh && this.accessToken && !this.isTokenExpiring()) {
            if (!this.tokenData) {
                throw new SafefyApiError("Cached token data is missing.", 500, "invalid_token_cache");
            }

            this.logger.log({
                level: "debug",
                event: "auth.token.cache_hit",
                message: "Using cached access token.",
                meta: {
                    expiresInSeconds: Math.max(0, Math.floor((this.tokenExpiresAt - Date.now()) / 1000)),
                },
            });

            return {
                ...this.tokenData,
                expiresIn: Math.max(0, Math.floor((this.tokenExpiresAt - Date.now()) / 1000)),
            };
        }

        if (this.pendingTokenPromise) {
            this.logger.log({
                level: "debug",
                event: "auth.token.reuse_pending",
                message: "Reusing in-flight token request.",
            });

            return this.pendingTokenPromise;
        }

        this.logger.log({
            level: "info",
            event: "auth.token.request",
            message: "Requesting new access token.",
        });

        this.pendingTokenPromise = this.request<TokenResponse>({
            method: "POST",
            path: "/v1/auth/token",
            auth: false,
            body: {
                grantType: "client_credentials",
                publicKey: this.publicKey,
                secretKey: this.secretKey,
            },
        })
            .then((response) => {
                if (!response?.data?.accessToken) {
                    throw new SafefyApiError("Token response did not include accessToken.", 500, "invalid_token_response", response);
                }

                const token = response.data;
                this.accessToken = token.accessToken;
                this.tokenData = token;
                this.tokenExpiresAt = Date.now() + token.expiresIn * 1000;

                this.logger.log({
                    level: "info",
                    event: "auth.token.success",
                    message: "Access token acquired.",
                    meta: {
                        environment: token.environment,
                        expiresIn: token.expiresIn,
                    },
                });

                return token;
            })
            .finally(() => {
                this.pendingTokenPromise = undefined;
            });

        return this.pendingTokenPromise;
    }

    public setAccessToken(token: string, expiresInSeconds = 3600): void {
        this.accessToken = token;
        this.tokenData = {
            accessToken: token,
            tokenType: "Bearer",
            expiresIn: expiresInSeconds,
            environment: "Production",
        };
        this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;

        this.logger.log({
            level: "warn",
            event: "auth.token.manual_set",
            message: "Manual access token set by consumer.",
            meta: {
                expiresInSeconds,
            },
        });
    }

    public clearToken(): void {
        this.accessToken = undefined;
        this.tokenData = undefined;
        this.tokenExpiresAt = 0;

        this.logger.log({
            level: "info",
            event: "auth.token.cleared",
            message: "Cached token cleared.",
        });
    }

    private async getAccessToken(): Promise<string> {
        if (!this.accessToken || this.isTokenExpiring()) {
            const token = await this.getToken(true);
            return token.accessToken;
        }

        return this.accessToken;
    }

    private isTokenExpiring(): boolean {
        if (!this.accessToken || this.tokenExpiresAt <= 0) {
            return true;
        }

        return Date.now() + this.tokenRefreshBufferMs >= this.tokenExpiresAt;
    }

    private buildUrl(path: string, query?: Record<string, unknown>): string {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const url = new URL(`${this.baseUrl}${normalizedPath}`);

        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null || value === "") {
                    continue;
                }

                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (item !== undefined && item !== null) {
                            url.searchParams.append(key, String(item));
                        }
                    }
                    continue;
                }

                url.searchParams.set(key, String(value));
            }
        }

        return url.toString();
    }

    private async fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            return await this.fetchFn(input, {
                ...init,
                signal: controller.signal,
            });
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                throw new SafefyApiError(`Request timeout after ${this.timeoutMs}ms.`, 408, "request_timeout");
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private extractErrorMessage(body: unknown): string | undefined {
        if (!body || typeof body !== "object") {
            return undefined;
        }

        const typedBody = body as { error?: { message?: string }; message?: string };
        return typedBody.error?.message ?? typedBody.message;
    }

    private extractErrorCode(body: unknown): string | undefined {
        if (!body || typeof body !== "object") {
            return undefined;
        }

        const typedBody = body as { error?: { code?: string } };
        return typedBody.error?.code;
    }

    private safeJsonParse(payload: string | undefined): unknown {
        if (!payload) {
            return undefined;
        }

        try {
            return JSON.parse(payload);
        } catch {
            return payload;
        }
    }

    private sanitize(input: unknown): unknown {
        if (input === null || input === undefined) {
            return input;
        }

        if (Array.isArray(input)) {
            return input.map((value) => this.sanitize(value));
        }

        if (typeof input !== "object") {
            return input;
        }

        const source = input as Record<string, unknown>;
        const masked: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(source)) {
            const lower = key.toLowerCase();
            const shouldMask =
                lower.includes("secret") ||
                lower.includes("token") ||
                lower === "authorization" ||
                lower.includes("password") ||
                lower.includes("key");

            masked[key] = shouldMask ? "***" : this.sanitize(value);
        }

        return masked;
    }

    private summarizeSuccessResponse(body: unknown): unknown {
        if (!body || typeof body !== "object") {
            return undefined;
        }

        const payload = body as Record<string, unknown>;
        const data = payload.data;

        if (!data || typeof data !== "object") {
            return undefined;
        }

        const result: Record<string, unknown> = {};
        const typedData = data as Record<string, unknown>;

        if (Array.isArray(typedData.items)) {
            result.itemsCount = typedData.items.length;
        }

        const summaryFields = [
            "id",
            "status",
            "page",
            "pageSize",
            "totalItems",
            "totalPages",
            "hasNextPage",
            "hasPreviousPage",
            "environment",
        ];

        for (const field of summaryFields) {
            const value = typedData[field];
            if (value !== undefined) {
                result[field] = value;
            }
        }

        return Object.keys(result).length > 0 ? result : undefined;
    }
}
