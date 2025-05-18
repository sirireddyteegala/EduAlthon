export interface LoginForm {
    'email_mobile': string;
}

export interface OtpResponse {
    message: string;
    request_id: string;
    valid_for: number;
    resend_after: number;
  }
  