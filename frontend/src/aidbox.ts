export interface User {
    id?: string;
    email: string;
    twoFactor?: {
        enabled: boolean;
        secretKey: string;
        transport?: string;
    };
}
