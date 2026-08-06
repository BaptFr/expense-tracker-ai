"use client";

import { useExpenses } from "@/context/ExpensesContext";
import { useToast } from "@/context/ToastContext";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCloudExport } from "@/components/cloud-export/useCloudExport";
import { TemplateGrid } from "@/components/cloud-export/TemplateGrid";
import { PreviewPanel } from "@/components/cloud-export/PreviewPanel";
import { EmailExportCard } from "@/components/cloud-export/EmailExportCard";
import { ShareLinkCard } from "@/components/cloud-export/ShareLinkCard";
import { CloudConnectionsGrid } from "@/components/cloud-export/CloudConnectionsGrid";
import { BackupScheduleCard } from "@/components/cloud-export/BackupScheduleCard";
import { ExportHistoryTable } from "@/components/cloud-export/ExportHistoryTable";

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-[#0b0b0b]">{title}</h2>
      <p className="text-xs text-[#898781]">{subtitle}</p>
    </div>
  );
}

export default function ExportCenterPage() {
  const { expenses, isLoading } = useExpenses();
  const { showToast } = useToast();
  const cloud = useCloudExport(expenses);

  if (isLoading) return <PageSpinner />;

  async function handleDownload(templateId: Parameters<typeof cloud.download>[0]) {
    const result = await cloud.download(templateId);
    showToast(`Downloaded ${result.recordCount} record${result.recordCount === 1 ? "" : "s"}.`);
  }

  async function handleSendEmail(recipient: string) {
    await cloud.sendEmail(cloud.selectedTemplateId, recipient);
    showToast(`Emailed "${cloud.selectedTemplate.label}" to ${recipient}.`);
  }

  async function handleSync(id: Parameters<typeof cloud.sync>[0]) {
    await cloud.sync(id, cloud.selectedTemplateId);
    showToast(`Synced "${cloud.selectedTemplate.label}" to your cloud destination.`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#0b0b0b]">Export Center</h1>
            <span className="rounded-full bg-[#fdf1dc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8a6400]">
              Demo integrations
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#52514e]">
            Send, sync, and share your expense data — templates, email, cloud sync, and scheduled backups.
          </p>
        </div>
      </div>

      <section>
        <SectionHeading title="Templates" subtitle="Pick a preset shaped for a specific purpose. Selecting one updates the preview and every action below." />
        <TemplateGrid
          templates={cloud.templates}
          expenses={expenses}
          selectedTemplateId={cloud.selectedTemplateId}
          onSelect={cloud.setSelectedTemplateId}
          onDownload={handleDownload}
          pendingAction={cloud.pendingAction}
        />
      </section>

      <section>
        <SectionHeading title="Preview" subtitle="Exactly what the selected template will produce." />
        <div className="rounded-xl border border-[#e1e0d9] bg-white p-4">
          <PreviewPanel {...cloud.preview} />
        </div>
      </section>

      <section>
        <SectionHeading title="Send & share" subtitle="Get this export to someone else, or to yourself elsewhere." />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <EmailExportCard
            template={cloud.selectedTemplate}
            isSending={cloud.pendingAction === "email"}
            onSend={handleSendEmail}
          />
          <ShareLinkCard shareLink={cloud.shareLink} isGenerating={cloud.isGeneratingLink} onGenerate={cloud.generateLink} />
        </div>
      </section>

      <section>
        <SectionHeading title="Cloud sync" subtitle="Connect a service to push exports there automatically." />
        <CloudConnectionsGrid
          connections={cloud.connections}
          pendingAction={cloud.pendingAction}
          templateLabel={cloud.selectedTemplate.label}
          onConnect={cloud.connect}
          onDisconnect={cloud.disconnect}
          onSync={handleSync}
        />
      </section>

      <section>
        <SectionHeading title="Automatic backups" subtitle="Set it once and forget it." />
        <BackupScheduleCard
          schedule={cloud.schedule}
          templates={cloud.templates}
          nextRunLabel={cloud.nextRunLabel}
          onSave={cloud.updateSchedule}
        />
      </section>

      <section>
        <SectionHeading title="History" subtitle="Every export triggered from this page, most recent first." />
        <ExportHistoryTable history={cloud.history} onClear={cloud.clearHistory} />
      </section>
    </div>
  );
}
