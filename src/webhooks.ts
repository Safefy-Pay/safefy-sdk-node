import { createHmac, timingSafeEqual } from "node:crypto";

export const SAFEFY_SIGNATURE_HEADER = "x-safefy-signature-v2";
export const SAFEFY_TIMESTAMP_HEADER = "x-safefy-timestamp";

export interface VerifyWebhookOptions {
    /** Segredo de assinatura do webhook (painel Safefy → Webhooks). */
    secret: string;
    /** Diferença máxima aceita entre o timestamp do envio e agora. Padrão: 300 s. */
    toleranceSeconds?: number;
    /** Relógio usado na verificação (para testes). */
    now?: () => number;
}

type HeaderBag = Record<string, string | string[] | undefined> | Headers;

function readHeader(headers: HeaderBag, name: string): string | undefined {
    if (typeof (headers as Headers).get === "function") {
        return (headers as Headers).get(name) ?? undefined;
    }

    const bag = headers as Record<string, string | string[] | undefined>;
    const key = Object.keys(bag).find((candidate) => candidate.toLowerCase() === name);
    const value = key ? bag[key] : undefined;
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Confere a assinatura de um callback da Safefy (auditoria RF-09).
 *
 * Header `X-Safefy-Signature-V2: t={timestamp},v1={hex(HMAC-SHA256(secret, "{timestamp}.{corpo}"))}`.
 * Use o corpo **cru** (string ou Buffer exatamente como recebido), não o JSON já convertido.
 * Recusa timestamps fora da tolerância (padrão 5 minutos) para impedir reenvio de um aviso antigo.
 */
export function verifyWebhookSignature(
    rawBody: string | Buffer,
    headers: HeaderBag,
    options: VerifyWebhookOptions,
): boolean {
    if (!options.secret) {
        return false;
    }

    const header = readHeader(headers, SAFEFY_SIGNATURE_HEADER);
    if (!header) {
        return false;
    }

    const parts = new Map(
        header.split(",").map((part) => {
            const index = part.indexOf("=");
            return [part.slice(0, index).trim(), part.slice(index + 1).trim()] as const;
        }),
    );
    const timestamp = Number(parts.get("t"));
    const signature = parts.get("v1");
    if (!Number.isInteger(timestamp) || !signature) {
        return false;
    }

    const tolerance = options.toleranceSeconds ?? 300;
    const nowSeconds = Math.floor((options.now?.() ?? Date.now()) / 1000);
    if (Math.abs(nowSeconds - timestamp) > tolerance) {
        return false;
    }

    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
    const expected = createHmac("sha256", options.secret).update(`${timestamp}.${body}`).digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(signature.toLowerCase());
    return a.length === b.length && timingSafeEqual(a, b);
}
