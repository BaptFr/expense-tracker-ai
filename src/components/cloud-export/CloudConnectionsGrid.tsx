import { CLOUD_SERVICES, CloudServiceId, ConnectionsState } from "@/lib/cloudExport/types";
import { formatRelativeTime } from "@/lib/cloudExport/relativeTime";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CloudIcon } from "@/components/cloud-export/icons";

interface CloudConnectionsGridProps {
  connections: ConnectionsState;
  pendingAction: string | null;
  templateLabel: string;
  onConnect: (id: CloudServiceId) => void;
  onDisconnect: (id: CloudServiceId) => void;
  onSync: (id: CloudServiceId) => void;
}

export function CloudConnectionsGrid({
  connections,
  pendingAction,
  templateLabel,
  onConnect,
  onDisconnect,
  onSync,
}: CloudConnectionsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {CLOUD_SERVICES.map((service) => {
        const state = connections?.[service.id];
        const isConnected = state?.connected ?? false;
        const isConnecting = pendingAction === `connect:${service.id}`;
        const isSyncing = pendingAction === `sync:${service.id}`;

        return (
          <div key={service.id} className="flex flex-col gap-3 rounded-xl border border-[#e1e0d9] bg-white p-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: service.accent }}
              >
                <CloudIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-[#0b0b0b]">{service.label}</h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-[#0ca30c]" : "bg-[#c3c2b7]"}`}
                    aria-hidden
                  />
                  <span className="text-xs text-[#898781]">{isConnected ? "Connecté" : "Non connecté"}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#898781]">{service.description}</p>

            {isConnected && state?.lastSyncedAt && (
              <p className="text-xs text-[#52514e]">Dernière synchro {formatRelativeTime(state.lastSyncedAt)}</p>
            )}

            {isConnected ? (
              <div className="mt-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onSync(service.id)}
                  disabled={isSyncing}
                  className="flex-1 px-2.5 py-1.5 text-xs"
                  title={`Synchroniser « ${templateLabel} » vers ${service.label}`}
                >
                  {isSyncing && <Spinner className="h-3.5 w-3.5" />}
                  {isSyncing ? "Synchronisation…" : "Synchroniser"}
                </Button>
                <button
                  type="button"
                  onClick={() => onDisconnect(service.id)}
                  className="rounded-md px-2 py-1.5 text-xs font-medium text-[#898781] hover:bg-[#f9f9f7] hover:text-[#d03b3b]"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onConnect(service.id)}
                disabled={isConnecting}
                className="mt-auto text-xs"
              >
                {isConnecting && <Spinner className="h-3.5 w-3.5" />}
                {isConnecting ? "Connexion…" : "Connecter"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
