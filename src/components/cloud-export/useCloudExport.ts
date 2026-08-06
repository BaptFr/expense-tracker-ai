import { useCallback, useEffect, useMemo, useState } from "react";
import { Expense } from "@/types/expense";
import {
  CLOUD_SERVICES,
  CloudServiceId,
  ConnectionsState,
  ExportHistoryEntry,
  ScheduleConfig,
  ShareLink,
  TemplateId,
} from "@/lib/cloudExport/types";
import { downloadTemplate, previewTemplate } from "@/lib/cloudExport";
import { EXPORT_TEMPLATES, getTemplate } from "@/lib/cloudExport/templates";
import { clearExportHistory, loadExportHistory, recordExport } from "@/lib/cloudExport/history";
import {
  connectService,
  disconnectService,
  EMPTY_CONNECTIONS_STATE,
  loadConnections,
  markSynced,
} from "@/lib/cloudExport/connections";
import { computeNextRunLabel, DEFAULT_SCHEDULE, loadSchedule, saveSchedule } from "@/lib/cloudExport/schedule";
import { generateShareLink, ShareExpiry } from "@/lib/cloudExport/share";

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function simulatedDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 500));
}

export function useCloudExport(expenses: Expense[]) {
  const [history, setHistory] = useState<ExportHistoryEntry[]>([]);
  const [connections, setConnections] = useState<ConnectionsState>(EMPTY_CONNECTIONS_STATE);
  const [schedule, setScheduleState] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>("tax-report");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    setHistory(loadExportHistory());
    setConnections(loadConnections());
    setScheduleState(loadSchedule());
  }, []);

  const selectedTemplate = useMemo(() => getTemplate(selectedTemplateId), [selectedTemplateId]);
  const preview = useMemo(() => selectedTemplate.build(expenses), [selectedTemplate, expenses]);

  const download = useCallback(
    async (templateId: TemplateId) => {
      setPendingAction(`download:${templateId}`);
      try {
        await yieldFrame();
        const result = downloadTemplate(expenses, templateId);
        const template = getTemplate(templateId);
        setHistory(
          recordExport({
            templateId,
            templateLabel: template.label,
            format: result.format,
            destination: "download",
            destinationLabel: "Downloaded",
            recordCount: result.recordCount,
            filename: result.filename,
          })
        );
        return result;
      } finally {
        setPendingAction(null);
      }
    },
    [expenses]
  );

  const sendEmail = useCallback(
    async (templateId: TemplateId, recipient: string) => {
      setPendingAction("email");
      try {
        const result = previewTemplate(expenses, templateId);
        await simulatedDelay();
        const template = getTemplate(templateId);
        setHistory(
          recordExport({
            templateId,
            templateLabel: template.label,
            format: result.format,
            destination: "email",
            destinationLabel: `Emailed to ${recipient}`,
            recordCount: result.recordCount,
            filename: result.filename,
          })
        );
        return result;
      } finally {
        setPendingAction(null);
      }
    },
    [expenses]
  );

  const connect = useCallback(async (id: CloudServiceId) => {
    setPendingAction(`connect:${id}`);
    try {
      setConnections(await connectService(id));
    } finally {
      setPendingAction(null);
    }
  }, []);

  const disconnect = useCallback((id: CloudServiceId) => {
    setConnections(disconnectService(id));
  }, []);

  const sync = useCallback(
    async (id: CloudServiceId, templateId: TemplateId) => {
      setPendingAction(`sync:${id}`);
      try {
        const result = previewTemplate(expenses, templateId);
        const nextConnections = await markSynced(id);
        setConnections(nextConnections);
        const template = getTemplate(templateId);
        const service = CLOUD_SERVICES.find((s) => s.id === id);
        setHistory(
          recordExport({
            templateId,
            templateLabel: template.label,
            format: result.format,
            destination: id,
            destinationLabel: `Synced to ${service?.label ?? id}`,
            recordCount: result.recordCount,
            filename: result.filename,
          })
        );
        return result;
      } finally {
        setPendingAction(null);
      }
    },
    [expenses]
  );

  const generateLink = useCallback(async (expiry: ShareExpiry) => {
    setIsGeneratingLink(true);
    try {
      setShareLink(await generateShareLink(expiry));
    } finally {
      setIsGeneratingLink(false);
    }
  }, []);

  const updateSchedule = useCallback((config: ScheduleConfig) => {
    setScheduleState(saveSchedule(config));
  }, []);

  const clearHistory = useCallback(() => setHistory(clearExportHistory()), []);

  return {
    templates: EXPORT_TEMPLATES,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedTemplate,
    preview,
    history,
    connections,
    schedule,
    pendingAction,
    shareLink,
    isGeneratingLink,
    download,
    sendEmail,
    connect,
    disconnect,
    sync,
    generateLink,
    updateSchedule,
    clearHistory,
    nextRunLabel: computeNextRunLabel(schedule),
  };
}
