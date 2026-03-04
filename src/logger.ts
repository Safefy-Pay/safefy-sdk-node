import type {
    SafefyLoggerConfig,
    SafefyLogEntry,
    SafefyLogLevel,
} from "./types";

const RESET = "\x1b[0m";
const GRAY = "\x1b[90m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";

function getLevelColor(level: SafefyLogLevel): string {
    if (level === "debug") return GRAY;
    if (level === "info") return CYAN;
    if (level === "warn") return YELLOW;
    return RED;
}

function serializePayload(payload: unknown): string {
    if (payload === undefined) return "";

    try {
        return JSON.stringify(payload);
    } catch {
        return String(payload);
    }
}

function parseLevelValue(level: SafefyLogLevel): number {
    if (level === "debug") return 10;
    if (level === "info") return 20;
    if (level === "warn") return 30;
    return 40;
}

export class SafefyLogger {
    private readonly config: {
        enabled: boolean;
        colors: boolean;
        level: SafefyLogLevel;
        includeHeaders: boolean;
        includeBody: boolean;
        onLog: ((entry: SafefyLogEntry) => void) | undefined;
    };

    constructor(config?: boolean | SafefyLoggerConfig) {
        if (config === false || config === undefined) {
            this.config = {
                enabled: false,
                colors: true,
                level: "info",
                includeHeaders: false,
                includeBody: true,
                onLog: undefined,
            };

            return;
        }

        if (config === true) {
            this.config = {
                enabled: true,
                colors: true,
                level: "debug",
                includeHeaders: false,
                includeBody: true,
                onLog: undefined,
            };

            return;
        }

        this.config = {
            enabled: config.enabled ?? true,
            colors: config.colors ?? true,
            level: config.level ?? "debug",
            includeHeaders: config.includeHeaders ?? false,
            includeBody: config.includeBody ?? true,
            onLog: config.onLog,
        };
    }

    public shouldIncludeHeaders(): boolean {
        return this.config.enabled && this.config.includeHeaders;
    }

    public shouldIncludeBody(): boolean {
        return this.config.enabled && this.config.includeBody;
    }

    public log(entry: Omit<SafefyLogEntry, "timestamp">): void {
        if (!this.config.enabled) {
            return;
        }

        if (parseLevelValue(entry.level) < parseLevelValue(this.config.level)) {
            return;
        }

        const fullEntry: SafefyLogEntry = {
            ...entry,
            timestamp: new Date().toISOString(),
        };

        if (this.config.onLog) {
            this.config.onLog(fullEntry);
            return;
        }

        this.printConsole(fullEntry);
    }

    private printConsole(entry: SafefyLogEntry): void {
        const levelText = entry.level.toUpperCase();
        const levelColor = getLevelColor(entry.level);
        const statusPart = entry.status !== undefined ? ` status=${entry.status}` : "";
        const durationPart = entry.durationMs !== undefined ? ` duration=${entry.durationMs}ms` : "";

        if (!this.config.colors) {
            const baseLine = `[SafefySDK] ${entry.timestamp} ${levelText} ${entry.event}${statusPart}${durationPart}`;
            const messageLine = entry.message ? ` - ${entry.message}` : "";
            const metaLine = entry.meta ? ` ${serializePayload(entry.meta)}` : "";
            console.log(`${baseLine}${messageLine}${metaLine}`);
            return;
        }

        const coloredBase = `${MAGENTA}[SafefySDK]${RESET} ${GRAY}${entry.timestamp}${RESET} ${levelColor}${levelText}${RESET} ${GREEN}${entry.event}${RESET}${statusPart}${durationPart}`;
        const coloredMessage = entry.message ? ` ${CYAN}${entry.message}${RESET}` : "";
        const coloredMeta = entry.meta ? ` ${GRAY}${serializePayload(entry.meta)}${RESET}` : "";

        console.log(`${coloredBase}${coloredMessage}${coloredMeta}`);
    }
}
