import { ScheduleConfig } from "@/lib/cloudExport/types";
import { readJson, writeJson } from "@/lib/cloudExport/storage";

const SCHEDULE_KEY = "expense-tracker:export-schedule";

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false,
  frequency: "weekly",
  destination: "download",
  templateId: "full-backup",
};

export function loadSchedule(): ScheduleConfig {
  return readJson<ScheduleConfig>(SCHEDULE_KEY, DEFAULT_SCHEDULE);
}

export function saveSchedule(config: ScheduleConfig): ScheduleConfig {
  writeJson(SCHEDULE_KEY, config);
  return config;
}

/** Purely informational — there's no server to actually run this on a timer. */
export function computeNextRunLabel(config: ScheduleConfig): string {
  if (!config.enabled) return "Not scheduled";

  const next = new Date();
  if (config.frequency === "daily") next.setDate(next.getDate() + 1);
  else if (config.frequency === "weekly") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1, 1);

  return next.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
