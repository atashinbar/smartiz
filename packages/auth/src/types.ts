export interface OTPProvider {
  send(phone: string): Promise<string>;
}
