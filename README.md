# Safefy SDK

[![npm version](https://img.shields.io/npm/v/%40safefypay%2Fsafefy-sdk-node?label=Version&logo=npm)](https://www.npmjs.com/package/@safefypay/safefy-sdk-node)
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
        includeBody: false,
        onLog(entry) {
            console.log(entry);
        },
    },
});
```

> ⚠️ Não ligue `includeBody` em produção. Mesmo com o mascaramento automático de chaves, cartão (PAN/CVV) e CPF/CNPJ, o corpo das requisições não deve ir para logs compartilhados.

## Verificar a assinatura dos webhooks

Todo callback da Safefy traz `X-Safefy-Signature-V2: t={timestamp},v1={hmac}`. Confira antes de liberar qualquer pedido, usando o corpo **cru** da requisição:

```ts
import express from "express";
import { verifyWebhookSignature } from "@safefypay/safefy-sdk-node";

app.post("/webhooks/safefy", express.raw({ type: "application/json" }), (req, res) => {
    const ok = verifyWebhookSignature(req.body, req.headers, {
        secret: process.env.SAFEFY_WEBHOOK_SECRET!,
    });
    if (!ok) return res.sendStatus(401);

    const event = JSON.parse(req.body.toString("utf8"));
    // ... processa o evento
    res.sendStatus(200);
});
```

Avisos com mais de 5 minutos são recusados (`toleranceSeconds` muda o limite).


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

### Publicar uma nova versão

O projeto não usa CI: a verificação roda localmente.

- `npm install` ativa o hook de `pre-push` (`.githooks/pre-push`), que roda `npm run verify` antes de cada push. Em emergência: `git push --no-verify`.
- Para lançar:
  1. `npm run release:patch` (ou `:minor` / `:major`) numa branch, abrir PR e fazer merge na `main`.
  2. Na `main` atualizada: `npm run release`. O script confere se a árvore está limpa e igual a `origin/main`, roda `npm run verify`, publica no npm, cria e envia a tag `vX.Y.Z` e cria a release no GitHub (`gh`, com notas geradas a partir dos PRs).

Requer `gh` autenticado (`gh auth login`) e login no npm.

## Versionamento

A Safefy SDK segue versionamento semântico no formato `MAJOR.MINOR.PATCH`.

- `MAJOR` (`X.0.0`): mudanças que podem exigir ajustes no seu código (quebras de compatibilidade).
- `MINOR` (`1.X.0`): novas funcionalidades sem quebrar o que já funciona.
- `PATCH` (`1.0.X`): correções e melhorias internas sem alterar comportamento esperado.

Recomendação para produção:

- Atualize automaticamente apenas `PATCH` e `MINOR`.
- Planeje a migração de versões `MAJOR` com testes antes de publicar em produção.

## Novidades

### 1.3.0

- Saldo por grupo de liquidação: `balance.settlementGroups` (id e disponível de cada grupo) e `balance.availableTotal`.
- `settlementGroupId` em `CreateCashoutRequest` para escolher de qual grupo o saque sai. O id é temporário: consulte o saldo logo antes de cada saque e não guarde o id.
- `cryptoPayoutAccountId` em `CreateCashoutRequest` e `payoutAccountId` (conta de saque cadastrada) documentado.

### 1.2.0

- Modo de autenticação `v2` (`authMode: "v2"` em `SafefyClientOptions`): as credenciais vão nos headers `X-Api-Key` e `X-Api-Secret` de cada requisição, sem a etapa de token. O padrão continua `v1`.
- Helper `verifyWebhookSignature` para validar o header `X-Safefy-Signature-V2` dos webhooks (veja [Verificar a assinatura dos webhooks](#verificar-a-assinatura-dos-webhooks)).
- Os logs mascaram automaticamente chaves, dados de cartão (PAN/CVV) e CPF/CNPJ.
- O campo `cardToken` foi removido de `CreateTransactionRequest`.

Histórico completo: [releases no GitHub](https://github.com/Safefy-Pay/safefy-sdk-node/releases).
