import type { OTPProvider } from "../types.js";
import { MockOTPProvider } from "./mock.js";
import { MeliPayamakProvider } from "./meli-payamak.js";

export function createOTPProvider(
  provider: "mock" | "meli-payamak",
  config?: { MELI_PAYAMAK_API_KEY?: string },
): OTPProvider {
  switch (provider) {
    case "mock":
      return new MockOTPProvider();
    case "meli-payamak":
      return new MeliPayamakProvider({ apiKey: config?.MELI_PAYAMAK_API_KEY });
    default:
      throw new Error(`Unknown OTP provider: ${provider}`);
  }
}
