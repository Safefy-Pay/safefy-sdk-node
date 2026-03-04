# Safefy SDK Node (TypeScript)

[![Version](https://img.shields.io/npm/v/safefy-sdk-node?label=Version&logo=npm)](https://www.npmjs.com/package/safefy-sdk-node)
[![Build Status](https://img.shields.io/github/actions/workflow/status/safefypay/safefy-sdk-node/ci.yml?label=Build%20Status&logo=github)](https://github.com/safefypay/safefy-sdk-node/actions)
[![Downloads](https://img.shields.io/npm/dm/safefy-sdk-node?label=Downloads&logo=npm)](https://www.npmjs.com/package/safefy-sdk-node)
[![Documentation PT-BR](https://img.shields.io/badge/Documentation-Portugues%20(BR)-009C3B)](./README.md)

[Versao em Portugues (PT-BR)](./README.md)

Official SDK to integrate with Safefy Payment API.

## Official links

- [Documentation](https://docs.safefypay.com.br/)
- [Safefy Dashboard](https://app.safefypay.com.br/)
- [API Credentials](https://app.safefypay.com.br/panel/merchant/api-credentials)
- [Fees and enabled payment methods per organization](https://app.safefypay.com.br/panel/merchant/fees)
- [Platform status](https://status.safefypay.com.br/)

## Installation

```bash
npm install safefy-sdk-node
```

## Quick setup

```ts
import { SafefyPaymentSDK } from "safefy-sdk-node";

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
        includeBody: true,
        onLog(entry) {
            console.log(entry);
        },
    },
});
```

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
import { SafefyApiError } from "safefy-sdk-node";

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
