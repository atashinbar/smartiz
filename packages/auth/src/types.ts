export interface OTPProvider {
  send(phone: string, code: string): Promise<boolean>;
}
