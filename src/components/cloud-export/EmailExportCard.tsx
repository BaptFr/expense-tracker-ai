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
      setError("Saisissez une adresse e-mail valide.");
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
          <h3 className="text-sm font-semibold text-[#0b0b0b]">Export par e-mail</h3>
          <p className="text-xs text-[#898781]">Envoie le modèle « {template.label} » en pièce jointe.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Destinataire" htmlFor="export-email-recipient" error={error ?? undefined}>
          <input
            id="export-email-recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="vous@exemple.com"
            className={inputClasses}
            aria-invalid={Boolean(error)}
          />
        </FormField>
        <Button type="submit" variant="secondary" disabled={isSending || !recipient} className="self-start">
          {isSending && <Spinner className="h-4 w-4" />}
          {isSending ? "Envoi en cours…" : "Envoyer l'e-mail"}
        </Button>
      </form>

      <p className="mt-3 text-xs text-[#898781]">
        Mode démo — ceci simule le flux d&apos;envoi. Aucun e-mail ne quitte réellement votre navigateur.
      </p>
    </div>
  );
}
