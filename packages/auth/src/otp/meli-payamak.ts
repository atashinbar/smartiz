import type { OTPProvider } from "../types.js";

export interface MeliPayamakConfig {
  apiKey?: string;
}

export class MeliPayamakProvider implements OTPProvider {
  private baseUrl: string;

  constructor(config: MeliPayamakConfig) {
    if (!config.apiKey) {
      throw new Error("MeliPayamak API key is required");
    }
    this.baseUrl = `https://console.melipayamak.com/api/send/otp/${config.apiKey}`;
  }

  async send(phone: string): Promise<string> {
    const formattedPhone = this.formatPhone(phone);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: formattedPhone }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`MeliPayamak API error: ${response.status}`);
      }

      const responseData = (await response.json()) as { code?: string; status?: string };

      if (!responseData.code) {
        throw new Error(responseData.status || "MeliPayamak failed to send OTP");
      }

      return responseData.code;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("MeliPayamak request timed out. Check your network connection.");
      }
      if (err instanceof TypeError && err.message === "fetch failed") {
        throw new Error("Cannot connect to MeliPayamak. Check your internet connection.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("98")) return "0" + digits.substring(2);
    if (!digits.startsWith("0")) return "0" + digits;
    return digits;
  }
}
