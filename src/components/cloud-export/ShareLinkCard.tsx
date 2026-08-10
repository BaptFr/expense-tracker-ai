"use client";

import { useState } from "react";
import { ShareLink } from "@/lib/cloudExport/types";
import { ShareExpiry } from "@/lib/cloudExport/share";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { LinkIcon } from "@/components/cloud-export/icons";

interface ShareLinkCardProps {
  shareLink: ShareLink | null;
  isGenerating: boolean;
  onGenerate: (expiry: ShareExpiry) => Promise<void>;
}

export function ShareLinkCard({ shareLink, isGenerating, onGenerate }: ShareLinkCardProps) {
  const [expiry, setExpiry] = useState<ShareExpiry>("7");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to in this demo.
    }
  }

  return (
    <div className="rounded-xl border border-[#e1e0d9] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf1dc] text-[#eda100]">
          <LinkIcon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#0b0b0b]">Shareable link</h3>
          <p className="text-xs text-[#898781]">Generate a link and QR code for the current preview.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <FormFieldInline label="Link expires">
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value as ShareExpiry)}
            className="rounded-lg border border-[#c3c2b7] bg-white px-3 py-2 text-sm text-[#0b0b0b] outline-none focus:border-[#2a78d6] focus:ring-2 focus:ring-[#2a78d6]/20"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="never">Never</option>
          </select>
        </FormFieldInline>
        <Button type="button" variant="secondary" onClick={() => onGenerate(expiry)} disabled={isGenerating}>
          {isGenerating && <Spinner className="h-4 w-4" />}
          {isGenerating ? "Generating…" : shareLink ? "Regenerate link" : "Generate link"}
        </Button>
      </div>

      {shareLink && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#f9f9f7] p-3 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shareLink.qrCodeDataUrl}
            alt="QR code linking to the shared export"
            className="h-24 w-24 rounded-md bg-white p-1.5 ring-1 ring-black/5"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-white px-2 py-1.5 text-xs text-[#52514e] ring-1 ring-black/5">
                {shareLink.url}
              </code>
              <Button type="button" variant="secondary" onClick={handleCopy} className="shrink-0 px-3 py-1.5 text-xs">
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-[#898781]">{shareLink.expiresLabel}</p>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-[#898781]">
        Demo mode — this link isn&apos;t actually hosted anywhere. In a live product it would resolve to a
        read-only, permissioned view of this export.
      </p>
    </div>
  );
}

function FormFieldInline({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[#0b0b0b]">{label}</span>
      {children}
    </label>
  );
}
