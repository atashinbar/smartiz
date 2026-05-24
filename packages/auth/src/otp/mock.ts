import type { OTPProvider } from "../types.js";
import { generateOTP } from "./utils.js";

export class MockOTPProvider implements OTPProvider {
  async send(phone: string): Promise<string> {
    const code = generateOTP();
    console.log(`[MockOTP] Phone: ${phone}, Code: ${code}`);
    return code;
  }
}
