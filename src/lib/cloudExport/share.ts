import QRCode from "qrcode";
import { ShareLink } from "@/lib/cloudExport/types";

export type ShareExpiry = "7" | "30" | "never";

const EXPIRY_LABELS: Record<ShareExpiry, string> = {
  "7": "Expire dans 7 jours",
  "30": "Expire dans 30 jours",
  never: "N'expire jamais",
};

function randomToken(): string {
  const source =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return source.replace(/-/g, "").slice(0, 10);
}

/** Demo-only: no backend exists to actually host this link. */
export async function generateShareLink(expiry: ShareExpiry): Promise<ShareLink> {
  const url = `https://expensely.app/share/${randomToken()}`;
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 220,
    color: { dark: "#0b0b0b", light: "#ffffff" },
  });

  return {
    url,
    createdAt: new Date().toISOString(),
    expiresLabel: EXPIRY_LABELS[expiry],
    qrCodeDataUrl,
  };
}
