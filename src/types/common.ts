export type PaymentMethod = "Pix" | "CreditCard" | "Boleto";

export type PaymentStatus =
    | "Pending"
    | "Processing"
    | "Completed"
    | "Cancelled"
    | "Expired"
    | "Failed"
    | "Refunded"
    | "PartiallyRefunded";

export type PayoutStatus =
    | "Pending"
    | "Approved"
    | "Processing"
    | "Confirming"
    | "Completed"
    | "Failed"
    | "Rejected"
    | "Cancelled"
    | "Unknown";

export type CurrencyType = "BRL";
export type ApiEnvironment = "Sandbox" | "Production";
export type CustomerStatus = "Active" | "Inactive";
export type CustomerDocumentType = "CPF" | "CNPJ";
export type PixKeyType = "CPF" | "CNPJ" | "Email" | "Phone" | "Random";

export interface ApiError {
    message?: string;
    code?: string;
}

export interface ApiResponse<T> {
    data?: T | null;
    message?: string | null;
    error?: ApiError | null;
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
