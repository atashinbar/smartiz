export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("98")) return digits;
  if (digits.startsWith("0")) return "98" + digits.substring(1);
  return "98" + digits;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  const formatted = formatPhone(phone);
  return /^989\d{9}$/.test(formatted);
}
