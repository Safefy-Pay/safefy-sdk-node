# Safefy SDK

[![npm version](https://img.shields.io/npm/v/%40safefypay%2Fsafefy-sdk-node?label=Version&logo=npm)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Safefy-Pay/safefy-sdk-node/ci.yml?branch=main&label=Build%20Status&logo=github)](https://github.com/Safefy-Pay/safefy-sdk-node/actions)
[![npm downloads](https://img.shields.io/npm/dt/%40safefypay%2Fsafefy-sdk-node?label=Downloads&logo=npm)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![Node version](https://img.shields.io/node/v/%40safefypay%2Fsafefy-sdk-node?label=Node.js&logo=node.js)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![License](https://img.shields.io/npm/l/%40safefypay%2Fsafefy-sdk-node?label=License)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
[![Documentation EN](https://img.shields.io/badge/Documentation-English-0A66C2)](./README.en.md)

SDK oficial para integrar com a Safefy Payment API.

## Links oficiais

- [Pacote no npm](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
- [Repositório no GitHub](https://github.com/Safefy-Pay/safefy-sdk-node)
- [Documentação](https://docs.safefypay.com.br/)
- [Painel Safefy](https://app.safefypay.com.br/)
- [Credenciais de API](https://app.safefypay.com.br/panel/merchant/api-credentials)
- [Taxas e métodos habilitados por organização](https://app.safefypay.com.br/panel/merchant/fees)
- [Status da plataforma](https://status.safefypay.com.br/)

## Instalação

```bash
npm install @safefypay/safefy-sdk-node
```

## Configuração rápida

```ts
import { SafefyPaymentSDK } from "@safefypay/safefy-sdk-node";

const sdk = new SafefyPaymentSDK({
    publicKey: process.env.SAFEFY_PUBLIC_KEY!,
    secretKey: process.env.SAFEFY_SECRET_KEY!,
    log: true,
});
```

## Criar uma transação

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
- Lança `SafefyApiError` com `status`, `code` e `details`
- Suporta logs coloridos de todo o fluxo HTTP/autenticação

## Métodos de pagamento suportados pela sua organização

Os métodos disponíveis para criar cobranças dependem da configuração da sua organização (merchant).

- Consulte no [painel de taxas e métodos habilitados](https://app.safefypay.com.br/panel/merchant/fees)
- Ajuste em [credenciais de API](https://app.safefypay.com.br/panel/merchant/api-credentials)
- Consulte a [documentação da API](https://docs.safefypay.com.br/) para payloads e regras

No SDK, os métodos aceitos no campo `method` são:

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

## Módulos principais

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

## Build local

```bash
npm run typecheck
npm run build
```

## Versionamento

A Safefy SDK segue versionamento semântico no formato `MAJOR.MINOR.PATCH`.

- `MAJOR` (`X.0.0`): mudanças que podem exigir ajustes no seu código (quebras de compatibilidade).
- `MINOR` (`1.X.0`): novas funcionalidades sem quebrar o que já funciona.
- `PATCH` (`1.0.X`): correções e melhorias internas sem alterar comportamento esperado.

Recomendação para produção:

- Atualize automaticamente apenas `PATCH` e `MINOR`.
- Planeje a migração de versões `MAJOR` com testes antes de publicar em produção.
