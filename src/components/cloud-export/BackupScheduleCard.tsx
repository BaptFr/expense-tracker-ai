"use client";

import { useEffect, useState } from "react";
import { TemplateDefinition } from "@/lib/cloudExport/templates";
import { DestinationId, ScheduleConfig, ScheduleFrequency } from "@/lib/cloudExport/types";
import { Button } from "@/components/ui/Button";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { ClockIcon } from "@/components/cloud-export/icons";
import { useToast } from "@/context/ToastContext";

const DESTINATION_LABELS: Record<DestinationId, string> = {
  download: "Télécharger sur l'appareil",
  email: "E-mail",
  "google-sheets": "Google Sheets",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

interface BackupScheduleCardProps {
  schedule: ScheduleConfig;
  templates: TemplateDefinition[];
  nextRunLabel: string;
  onSave: (config: ScheduleConfig) => void;
}

export function BackupScheduleCard({ schedule, templates, nextRunLabel, onSave }: BackupScheduleCardProps) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<ScheduleConfig>(schedule);

  useEffect(() => {
    setDraft(schedule);
  }, [schedule]);

  function handleSave() {
    onSave(draft);
    showToast(draft.enabled ? "Sauvegardes automatiques planifiées." : "Sauvegardes automatiques désactivées.");
  }

  return (
    <div className="rounded-xl border border-[#e1e0d9] bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fceef3] text-[#e87ba4]">
            <ClockIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0b0b0b]">Sauvegardes automatiques</h3>
            <p className="text-xs text-[#898781]">Exports récurrents selon la planification que vous définissez.</p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs font-medium text-[#52514e]">{draft.enabled ? "Activé" : "Désactivé"}</span>
          <input
            type="checkbox"
            role="switch"
            aria-checked={draft.enabled}
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
            className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-[#e1e0d9] transition-colors checked:bg-[#2a78d6] relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Fréquence" htmlFor="schedule-frequency">
          <select
            id="schedule-frequency"
            value={draft.frequency}
            onChange={(e) => setDraft({ ...draft, frequency: e.target.value as ScheduleFrequency })}
            className={inputClasses}
            disabled={!draft.enabled}
          >
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuelle</option>
          </select>
        </FormField>

        <FormField label="Modèle" htmlFor="schedule-template">
          <select
            id="schedule-template"
            value={draft.templateId}
            onChange={(e) => setDraft({ ...draft, templateId: e.target.value as ScheduleConfig["templateId"] })}
            className={inputClasses}
            disabled={!draft.enabled}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Destination" htmlFor="schedule-destination">
          <select
            id="schedule-destination"
            value={draft.destination}
            onChange={(e) => setDraft({ ...draft, destination: e.target.value as DestinationId })}
            className={inputClasses}
            disabled={!draft.enabled}
          >
            {Object.entries(DESTINATION_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-[#52514e]">
          Prochain export : <span className="font-medium text-[#0b0b0b]">{draft.enabled ? nextRunLabel : "Non planifié"}</span>
        </p>
        <Button type="button" variant="secondary" onClick={handleSave} className="text-xs">
          Enregistrer la planification
        </Button>
      </div>

      <p className="mt-3 text-xs text-[#898781]">
        Mode démo — il n&apos;y a pas de serveur pour exécuter ceci sur un minuteur, la planification est donc
        enregistrée mais ne se déclenchera pas réellement en arrière-plan.
      </p>
    </div>
  );
}
