"use client";

import { useState } from "react";
import { TemplateDefinition } from "@/lib/cloudExport/templates";
import { Button } from "@/components/ui/Button";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";
import { MailIcon } from "@/components/cloud-export/icons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailExportCardProps {
  template: TemplateDefinition;
  isSending: boolean;
  onSend: (recipient: string) => Promise<unknown>;
}

export function EmailExportCard({ template, isSending, onSend }: EmailExportCardProps) {
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(recipient.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    await onSend(recipient.trim());
    setRecipient("");
  }

  return (
    <div className="rounded-xl border border-[#e1e0d9] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2fc] text-[#2a78d6]">
          <MailIcon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#0b0b0b]">Email export</h3>
          <p className="text-xs text-[#898781]">Sends the “{template.label}” template as an attachment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Recipient" htmlFor="export-email-recipient" error={error ?? undefined}>
          <input
            id="export-email-recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
            aria-invalid={Boolean(error)}
          />
        </FormField>
        <Button type="submit" variant="secondary" disabled={isSending || !recipient} className="self-start">
          {isSending && <Spinner className="h-4 w-4" />}
          {isSending ? "Sending…" : "Send email"}
        </Button>
      </form>

      <p className="mt-3 text-xs text-[#898781]">
        Demo mode — this simulates the send flow. No email actually leaves your browser.
      </p>
    </div>
  );
}
