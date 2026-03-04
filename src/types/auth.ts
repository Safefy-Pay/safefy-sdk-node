import type { ApiEnvironment, ApiResponse } from "./common";

export interface TokenData {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    environment: ApiEnvironment;
}

export type TokenResponse = ApiResponse<TokenData>;
