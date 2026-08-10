import { CLOUD_SERVICES, CloudServiceId, ConnectionsState } from "@/lib/cloudExport/types";
import { readJson, writeJson } from "@/lib/cloudExport/storage";

const CONNECTIONS_KEY = "expense-tracker:cloud-connections";

export const EMPTY_CONNECTIONS_STATE: ConnectionsState = CLOUD_SERVICES.reduce((acc, service) => {
  acc[service.id] = { connected: false, connectedAt: null, lastSyncedAt: null };
  return acc;
}, {} as ConnectionsState);

export function loadConnections(): ConnectionsState {
  return readJson<ConnectionsState>(CONNECTIONS_KEY, EMPTY_CONNECTIONS_STATE);
}

function saveConnections(state: ConnectionsState): ConnectionsState {
  writeJson(CONNECTIONS_KEY, state);
  return state;
}

/** Simulates an OAuth-style round trip. No real network call — this is a demo integration. */
export async function connectService(id: CloudServiceId): Promise<ConnectionsState> {
  await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 500));
  const current = loadConnections();
  const now = new Date().toISOString();
  return saveConnections({
    ...current,
    [id]: { connected: true, connectedAt: now, lastSyncedAt: now },
  });
}

export function disconnectService(id: CloudServiceId): ConnectionsState {
  const current = loadConnections();
  return saveConnections({
    ...current,
    [id]: { connected: false, connectedAt: null, lastSyncedAt: null },
  });
}

export async function markSynced(id: CloudServiceId): Promise<ConnectionsState> {
  await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 500));
  const current = loadConnections();
  return saveConnections({
    ...current,
    [id]: { ...current[id], lastSyncedAt: new Date().toISOString() },
  });
}
