import type { OTPProvider } from "../types.js";

export class MockOTPProvider implements OTPProvider {
  async send(_phone: string, _code: string): Promise<boolean> {
    console.log("[MockOTP] Code 123456 would be sent");
    return true;
  }
}
