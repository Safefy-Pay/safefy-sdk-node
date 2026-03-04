import type {
    ApiResponse,
    CustomerDocumentType,
    CustomerStatus,
    PaginatedResponse,
} from "./common";

export interface CreateCustomerRequest {
    externalId?: string;
    name: string;
    email: string;
    document?: string;
    documentType?: CustomerDocumentType;
    phone?: string;
    metadata?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressPostalCode?: string;
    addressCountry?: string;
}

export interface UpdateCustomerRequest {
    name?: string;
    email?: string;
    document?: string;
    documentType?: CustomerDocumentType;
    phone?: string;
    status?: CustomerStatus;
    metadata?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressPostalCode?: string;
    addressCountry?: string;
}

export interface CustomerAddress {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface CustomerData {
    id: string;
    externalId?: string;
    name: string;
    email: string;
    document?: string;
    documentType?: CustomerDocumentType;
    phone?: string;
    status: CustomerStatus;
    metadata?: string;
    address?: CustomerAddress;
    createdAt: string;
}

export interface ListCustomersParams {
    page?: number;
    pageSize?: number;
    status?: CustomerStatus;
    documentType?: CustomerDocumentType;
    search?: string;
    externalId?: string;
    startDate?: string;
    endDate?: string;
}

export type CreateCustomerResponse = ApiResponse<CustomerData>;
export type ListCustomersResponse = ApiResponse<PaginatedResponse<CustomerData>>;
export type GetCustomerResponse = ApiResponse<CustomerData>;
export type UpdateCustomerResponse = ApiResponse<CustomerData>;
