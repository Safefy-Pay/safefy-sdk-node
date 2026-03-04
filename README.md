# Safefy SDK Node (TypeScript)

[![Version](https://img.shields.io/npm/v/safefy-sdk-node?label=Version&logo=npm)](https://www.npmjs.com/package/safefy-sdk-node)
[![Build Status](https://img.shields.io/github/actions/workflow/status/safefypay/safefy-sdk-node/ci.yml?label=Build%20Status&logo=github)](https://github.com/safefypay/safefy-sdk-node/actions)
[![Downloads](https://img.shields.io/npm/dm/safefy-sdk-node?label=Downloads&logo=npm)](https://www.npmjs.com/package/safefy-sdk-node)
[![Documentation EN](https://img.shields.io/badge/Documentation-English-0A66C2)](./README.en.md)

[English version](./README.en.md)

SDK oficial para integrar com a Safefy Payment API.

## Links oficiais

- [Documentação](https://docs.safefypay.com.br/)
- [Painel Safefy](https://app.safefypay.com.br/)
- [Credenciais de API](https://app.safefypay.com.br/panel/merchant/api-credentials)
- [Taxas e métodos habilitados por organização](https://app.safefypay.com.br/panel/merchant/fees)
- [Status da plataforma](https://status.safefypay.com.br/)

## Instalacao

```bash
npm install safefy-sdk-node
```

## Configuracao rapida

```ts
import { SafefyPaymentSDK } from "safefy-sdk-node";

const sdk = new SafefyPaymentSDK({
    publicKey: process.env.SAFEFY_PUBLIC_KEY!,
    secretKey: process.env.SAFEFY_SECRET_KEY!,
    log: true,
});
```

## Criar uma transacao

```ts
const transaction = await sdk.transactions.create({
    method: "Pix",
    amount: 1500,
    description: "Pedido #123",
    customerName: "Maria",
    customerDocument: "12345678901",
    customerEmail: "maria@email.com",
});

console.log(transaction.id, transaction.status, transaction.pix?.copyAndPaste);
```

## O que o SDK faz automaticamente

- Gera token em `POST /v1/auth/token`
- Renova token automaticamente antes de expirar
- Envia `Authorization: Bearer` nas rotas protegidas
- Lanca `SafefyApiError` com `status`, `code` e `details`
- Suporta logs coloridos de todo o fluxo HTTP/autenticacao

## Metodos de pagamento suportados pela sua organizacao

Os metodos disponiveis para criar cobrancas dependem da configuracao da sua organizacao (merchant).

- Consulte no [painel de taxas e metodos habilitados](https://app.safefypay.com.br/panel/merchant/fees)
- Ajuste em [credenciais de API](https://app.safefypay.com.br/panel/merchant/api-credentials)
- Consulte a [documentacao da API](https://docs.safefypay.com.br/) para payloads e regras

No SDK, os metodos aceitos no campo `method` sao:

- `Pix`
- `CreditCard`
- `Boleto`

## Logs (coloridos)

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

## Modulos principais

- `sdk.transactions`: `create`, `createRaw`, `list`, `listRaw`, `get`, `getRaw`, `simulate`, `simulateRaw`
- `sdk.cashouts`: `create`, `createRaw`, `list`, `listRaw`, `get`, `getRaw`
- `sdk.customers`: `create`, `createRaw`, `list`, `listRaw`, `get`, `getRaw`, `update`, `updateRaw`
- `sdk.balance`: `get`, `getRaw`

## Interfaces de resposta

- `TokenResponse`
- `CreateTransactionResponse`, `ListTransactionsResponse`, `GetTransactionResponse`, `SimulateTransactionResponse`
- `CreateCashoutResponse`, `ListCashoutsResponse`, `GetCashoutResponse`
- `CreateCustomerResponse`, `ListCustomersResponse`, `GetCustomerResponse`, `UpdateCustomerResponse`
- `GetBalanceResponse`

## Tratamento de erro

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

## Build local

```bash
npm run typecheck
npm run build
```
