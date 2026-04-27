import type { SafefyLoggerConfig } from "./logger";

export interface SafefyClientOptions {
    publicKey: string;
    secretKey: string;
    /**
     * Authentication mode.
     * - `v1` (default): generate a short-lived JWT via `POST /v1/auth/token` and send it as `Authorization: Bearer`.
     * - `v2`: send `X-Api-Key` + `X-Api-Secret` headers directly on every request, no token step required.
     */
    authMode?: "v1" | "v2";
    timeoutMs?: number;
    tokenRefreshBufferMs?: number;
    defaultHeaders?: Record<string, string>;
    fetchFn?: typeof fetch;
    log?: boolean | SafefyLoggerConfig;
}
