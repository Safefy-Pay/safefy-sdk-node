// Auditoria RF-08 / RF-09. Roda sobre o build: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { SafefyPaymentSDK, verifyWebhookSignature } from "../dist/index.js";

test("RF-08: includeBody não vaza secretKey, cartão, CVV nem documento", async () => {
    const logs = [];
    const fetchFn = async (url) => {
        const data = String(url).endsWith("/v1/auth/token")
            ? { data: { accessToken: "tok", tokenType: "Bearer", expiresIn: 3600, environment: "Sandbox" } }
            : { data: { id: "tx-1", status: "Pending" } };
        return new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } });
    };
    const sdk = new SafefyPaymentSDK({
        publicKey: "pk_test",
        secretKey: "sk_super_secreta",
        fetchFn,
        log: { enabled: true, level: "debug", includeBody: true, onLog: (entry) => logs.push(entry) },
    });

    await sdk.transactions.createRaw({
        method: "CreditCard",
        amount: 1000,
        cardNumber: "4111 1111 1111 1111",
        cardCvv: "123",
        cardExpirationMonth: "12",
        cardExpirationYear: "2030",
        customerDocument: "12345678901",
    });

    const text = JSON.stringify(logs);
    assert.ok(!text.includes("sk_super_secreta"), "secretKey no log");
    assert.ok(!text.includes("4111 1111 1111 1111") && !text.includes("4111111111111111"), "PAN no log");
    assert.ok(!text.includes('"123"'), "CVV no log");
    assert.ok(!text.includes('"2030"'), "validade no log");
    assert.ok(!text.includes("12345678901"), "documento no log");
    assert.ok(text.includes("****1111"), "últimos 4 dígitos continuam úteis para depuração");
});

test("RF-09: verifyWebhookSignature aceita só assinatura válida e recente", () => {
    const secret = "segredo-do-seller";
    const body = '{"event":"payment.completed","id":"tx-1"}';
    const now = 1_700_000_000_000;
    const t = Math.floor(now / 1000);
    const sign = (ts, payload) => `t=${ts},v1=${createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex")}`;

    assert.equal(verifyWebhookSignature(body, { "X-Safefy-Signature-V2": sign(t, body) }, { secret, now: () => now }), true);
    assert.equal(verifyWebhookSignature(Buffer.from(body), new Headers({ "x-safefy-signature-v2": sign(t, body) }), { secret, now: () => now }), true);
    assert.equal(verifyWebhookSignature(body.replace("tx-1", "tx-2"), { "x-safefy-signature-v2": sign(t, body) }, { secret, now: () => now }), false);
    assert.equal(verifyWebhookSignature(body, { "x-safefy-signature-v2": sign(t - 600, body) }, { secret, now: () => now }), false);
    assert.equal(verifyWebhookSignature(body, {}, { secret, now: () => now }), false);
    assert.equal(verifyWebhookSignature(body, { "x-safefy-signature-v2": sign(t, body) }, { secret: "", now: () => now }), false);
});
