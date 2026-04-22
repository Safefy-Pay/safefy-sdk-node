import type {
    ApiEnvironment,
    ApiResponse,
    CurrencyType,
    PaginatedResponse,
    PaymentMethod,
    PaymentStatus,
} from "./common";

export interface CreateTransactionRequest {
    method: PaymentMethod;
    amount: number;
    currency?: CurrencyType;
    description?: string;
    externalId?: string;
    customerId?: string;
    callbackUrl?: string;
    metadata?: string;
    pixExpirationMinutes?: number;
    customerName?: string;
    customerDocument?: string;
    customerEmail?: string;
    customerPhone?: string;
    cardNumber?: string;
    cardHolderName?: string;
    cardExpirationMonth?: string;
    cardExpirationYear?: string;
    installments?: number;
    cardCvv?: string;
    boletoDueDate?: string;
    boletoInstructions?: string;
}

export interface PixTransactionData {
    txId?: string;
    qrCode?: string;
    copyAndPaste?: string;
    expiresAt?: string;
}

export interface CardTransactionData {
    lastFour?: string;
    brand?: string;
    installments: number;
    authorizationCode?: string;
}

export interface BoletoTransactionData {
    barcode?: string;
    digitableLine?: string;
    pdfUrl?: string;
    dueDate?: string;
}

export interface TransactionData {
    id: string;
    externalId?: string;
    method: PaymentMethod;
    amount: number;
    fee: number;
    netAmount: number;
    currency: CurrencyType | string;
    status: PaymentStatus;
    description?: string;
    environment: ApiEnvironment;
    expiresAt?: string;
    createdAt: string;
    completedAt?: string;
    customerId?: string;
    orderId?: string;
    pix?: PixTransactionData;
    card?: CardTransactionData;
    boleto?: BoletoTransactionData;
}

export interface TransactionCustomer {
    id: string;
    name: string;
    email: string;
    document?: string;
    phone?: string;
}

export interface TransactionItem {
    productId: string;
    productName?: string;
    variantId?: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
}

export interface TransactionDetailData extends TransactionData {
    failureReason?: string;
    metadata?: string;
    callbackUrl?: string;
    productId?: string;
    variantId?: string;
    refundedAt?: string;
    updatedAt?: string;
    customer?: TransactionCustomer;
    items?: TransactionItem[];
}

export interface ListTransactionsParams {
    page?: number;
    pageSize?: number;
    method?: PaymentMethod;
    status?: PaymentStatus;
    externalId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
}

export type TransactionSimulateAction = "complete" | "expire" | "fail" | "refund";

export interface SimulatedTransactionData {
    id: string;
    status: PaymentStatus;
    simulatedAction: TransactionSimulateAction | string;
    completedAt?: string;
    refundedAt?: string;
    pix?: PixTransactionData;
}

export type CreateTransactionResponse = ApiResponse<TransactionData>;
export type ListTransactionsResponse = ApiResponse<PaginatedResponse<TransactionData>>;
export type GetTransactionResponse = ApiResponse<TransactionDetailData>;
export type SimulateTransactionResponse = ApiResponse<SimulatedTransactionData>;
