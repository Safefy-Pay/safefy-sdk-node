# Safefy SDK

[![npm version](https://img.shields.io/npm/v/%40safefypay%2Fsafefy-sdk-node?label=Version&logo=npm)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![npm downloads](https://img.shields.io/npm/dt/%40safefypay%2Fsafefy-sdk-node?label=Downloads&logo=npm)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![Node version](https://img.shields.io/node/v/%40safefypay%2Fsafefy-sdk-node?label=Node.js&logo=node.js)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![License](https://img.shields.io/npm/l/%40safefypay%2Fsafefy-sdk-node?label=License)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![Documentation PT-BR](https://img.shields.io/badge/Documentation-Portugues%20(BR)-009C3B)](./README.md)

Official SDK to integrate with Safefy Payment API.

## Official links

- [npm package](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
- [GitHub repository](https://github.com/Safefy-Pay/safefy-sdk-node)
- [Documentation](https://docs.safefypay.com.br/)
- [Safefy Dashboard](https://app.safefypay.com.br/)
- [API Credentials](https://app.safefypay.com.br/panel/merchant/api-credentials)
- [Fees and enabled payment methods per organization](https://app.safefypay.com.br/panel/merchant/fees)
- [Platform status](https://status.safefypay.com.br/)

## Installation

```bash
npm install @safefypay/safefy-sdk-node
```

## Quick setup

```ts
import { SafefyPaymentSDK } from "@safefypay/safefy-sdk-node";

const sdk = new SafefyPaymentSDK({
    publicKey: process.env.SAFEFY_PUBLIC_KEY!,
    secretKey: process.env.SAFEFY_SECRET_KEY!,
    log: true,
});
```

## Create a transaction

```ts
const transaction = await sdk.transactions.create({
    method: "Pix",
    amount: 1500,
    description: "Order #123",
    customerName: "Maria",
    customerDocument: "12345678901",
    customerEmail: "maria@email.com",
});

console.log(transaction.id, transaction.status, transaction.pix?.copyAndPaste);
```

## What the SDK handles automatically

- Creates token via `POST /v1/auth/token`
- Auto-refreshes token before expiration
- Sends `Authorization: Bearer` on protected routes
- Throws `SafefyApiError` with `status`, `code`, and `details`
- Supports colored logs for full HTTP/auth flow

## Payment methods available for your organization

Available methods depend on your merchant configuration.

- Check [organization settings for fees and enabled methods](https://app.safefypay.com.br/panel/merchant/fees)
- Manage [API credentials](https://app.safefypay.com.br/panel/merchant/api-credentials)
- Check [API documentation](https://docs.safefypay.com.br/) for rules and payload details

Accepted SDK `method` values:

- `Pix`
- `CreditCard`
- `Boleto`

## Colored logs

```ts
const sdk = new SafefyPaymentSDK({
    publicKey: process.env.SAFEFY_PUBLIC_KEY!,
    secretKey: process.env.SAFEFY_SECRET_KEY!,
    log: {
        enabled: true,
        colors: true,
        level: "debug",
        includeHeaders: false,
        includeBody: false,
        onLog(entry) {
            console.log(entry);
        },
    },
});
```

> ⚠️ Never enable `includeBody` in production. Even with automatic masking of keys, card data (PAN/CVV) and CPF/CNPJ, request bodies should not go to shared logs.

## Verifying webhook signatures

Every Safefy callback carries `X-Safefy-Signature-V2: t={timestamp},v1={hmac}`. Check it before fulfilling any order, using the **raw** request body:

```ts
import express from "express";
import { verifyWebhookSignature } from "@safefypay/safefy-sdk-node";

app.post("/webhooks/safefy", express.raw({ type: "application/json" }), (req, res) => {
    const ok = verifyWebhookSignature(req.body, req.headers, {
        secret: process.env.SAFEFY_WEBHOOK_SECRET!,
    });
    if (!ok) return res.sendStatus(401);

    const event = JSON.parse(req.body.toString("utf8"));
    // ... handle the event
    res.sendStatus(200);
});
```

Callbacks older than 5 minutes are rejected (`toleranceSeconds` changes the window).


## Main modules

- `sdk.transactions`: `create`, `createRaw`, `list`, `listRaw`, `get`, `getRaw`, `simulate`, `simulateRaw`
- `sdk.cashouts`: `create`, `createRaw`, `list`, `listRaw`, `get`, `getRaw`
- `sdk.customers`: `create`, `createRaw`, `list`, `listRaw`, `get`, `getRaw`, `update`, `updateRaw`
- `sdk.balance`: `get`, `getRaw`

## Response interfaces

- `TokenResponse`
- `CreateTransactionResponse`, `ListTransactionsResponse`, `GetTransactionResponse`, `SimulateTransactionResponse`
- `CreateCashoutResponse`, `ListCashoutsResponse`, `GetCashoutResponse`
- `CreateCustomerResponse`, `ListCustomersResponse`, `GetCustomerResponse`, `UpdateCustomerResponse`
- `GetBalanceResponse`

## Error handling

```ts
import { SafefyApiError } from "@safefypay/safefy-sdk-node";

try {
    await sdk.balance.get();
} catch (error) {
    if (error instanceof SafefyApiError) {
        console.error(error.status, error.code, error.message);
        console.error(error.details);
    }
}
```

## Local build

```bash
npm run typecheck
npm run build
```

### Releasing a new version

The project has no CI: checks run locally.

- `npm install` enables the `pre-push` hook (`.githooks/pre-push`), which runs `npm run verify` before every push. In an emergency: `git push --no-verify`.
- To release:
  1. `npm run release:patch` (or `:minor` / `:major`) on a branch, open a PR and merge it into `main`.
  2. On an up-to-date `main`: `npm run release`. The script checks that the tree is clean and matches `origin/main`, runs `npm run verify`, publishes to npm, creates and pushes the `vX.Y.Z` tag and creates the GitHub release (`gh`, with notes generated from the PRs).

Requires an authenticated `gh` (`gh auth login`) and an npm login.

## Versioning

Safefy SDK follows semantic versioning in the `MAJOR.MINOR.PATCH` format.

- `MAJOR` (`X.0.0`): changes that may require updates in your code (breaking changes).
- `MINOR` (`1.X.0`): new features without breaking existing integrations.
- `PATCH` (`1.0.X`): fixes and internal improvements without expected behavior changes.

Production recommendation:

- Auto-update only `PATCH` and `MINOR` versions.
- Plan `MAJOR` upgrades with validation tests before production rollout.

## What's new

### 1.2.0

- `v2` authentication mode (`authMode: "v2"` in `SafefyClientOptions`): credentials are sent in the `X-Api-Key` and `X-Api-Secret` headers on every request, with no token step. The default is still `v1`.
- `verifyWebhookSignature` helper to validate the `X-Safefy-Signature-V2` webhook header (see [Verifying webhook signatures](#verifying-webhook-signatures)).
- Logs automatically mask keys, card data (PAN/CVV) and CPF/CNPJ.
- The `cardToken` field was removed from `CreateTransactionRequest`.

Full history: [GitHub releases](https://github.com/Safefy-Pay/safefy-sdk-node/releases).
