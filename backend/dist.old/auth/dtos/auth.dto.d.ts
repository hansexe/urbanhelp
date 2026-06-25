export declare enum LoginMethod {
    EMAIL = "email",
    PHONE = "phone"
}
export declare class RegisterDto {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    phone: string;
    role: string;
}
export declare class LoginDto {
    method: LoginMethod;
    email?: string;
    phone?: string;
    password: string;
}
export declare class VerifyOtpDto {
    code: string;
    email?: string;
    phone?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    email: string;
    token: string;
    password: string;
}
