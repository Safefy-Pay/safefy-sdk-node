import type { SafefyLoggerConfig } from "./logger";

export interface SafefyClientOptions {
    publicKey: string;
    secretKey: string;
    timeoutMs?: number;
    tokenRefreshBufferMs?: number;
    defaultHeaders?: Record<string, string>;
    fetchFn?: typeof fetch;
    log?: boolean | SafefyLoggerConfig;
}
