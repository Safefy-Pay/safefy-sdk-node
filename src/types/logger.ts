export type SafefyLogLevel = "debug" | "info" | "warn" | "error";

export interface SafefyLogEntry {
    timestamp: string;
    level: SafefyLogLevel;
    event: string;
    message?: string;
    status?: number;
    durationMs?: number;
    meta?: unknown;
}

export interface SafefyLoggerConfig {
    enabled?: boolean;
    colors?: boolean;
    level?: SafefyLogLevel;
    includeHeaders?: boolean;
    includeBody?: boolean;
    onLog?: (entry: SafefyLogEntry) => void;
}
