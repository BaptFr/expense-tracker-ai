export type ExportFormat = "csv" | "json" | "pdf";

export type TemplateId = "tax-report" | "monthly-summary" | "category-analysis" | "full-backup";

export type CloudServiceId = "google-sheets" | "dropbox" | "onedrive";

export type DestinationId = "download" | "email" | CloudServiceId;

export interface CloudServiceMeta {
  id: CloudServiceId;
  label: string;
  description: string;
  accent: string;
}

export const CLOUD_SERVICES: CloudServiceMeta[] = [
  {
    id: "google-sheets",
    label: "Google Sheets",
    description: "Push a live-updating copy of your expenses to a spreadsheet.",
    accent: "#1baf7a",
  },
  {
    id: "dropbox",
    label: "Dropbox",
    description: "Save exports straight into a synced Dropbox folder.",
    accent: "#2a78d6",
  },
  {
    id: "onedrive",
    label: "OneDrive",
    description: "Keep a rolling backup in your Microsoft OneDrive.",
    accent: "#0b0b0b",
  },
];

export interface ConnectionState {
  connected: boolean;
  connectedAt: string | null;
  lastSyncedAt: string | null;
}

export type ConnectionsState = Record<CloudServiceId, ConnectionState>;

export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface ScheduleConfig {
  enabled: boolean;
  frequency: ScheduleFrequency;
  destination: DestinationId;
  templateId: TemplateId;
}

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;
  templateId: TemplateId;
  templateLabel: string;
  format: ExportFormat;
  destination: DestinationId;
  destinationLabel: string;
  recordCount: number;
  filename: string;
}

export interface ShareLink {
  url: string;
  createdAt: string;
  expiresLabel: string;
  qrCodeDataUrl: string;
}
