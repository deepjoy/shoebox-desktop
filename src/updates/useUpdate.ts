import { useCallback, useEffect, useRef, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "up-to-date"
  | "downloading"
  | "installing"
  | "error";

export type UpdateState = {
  status: UpdateStatus;
  update: Update | null;
  error: string | null;
  downloaded: number;
  total: number | null;
  checkForUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
};

export function useUpdate(): UpdateState {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [update, setUpdate] = useState<Update | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const inflight = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    setStatus("checking");
    setError(null);
    try {
      const found = await check();
      if (found) {
        setUpdate(found);
        setStatus("available");
      } else {
        setUpdate(null);
        setStatus("up-to-date");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    } finally {
      inflight.current = false;
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!update) return;
    setError(null);
    setDownloaded(0);
    setTotal(null);
    setStatus("downloading");
    try {
      await update.downloadAndInstall((e) => {
        if (e.event === "Started") {
          setTotal(e.data.contentLength ?? null);
        } else if (e.event === "Progress") {
          setDownloaded((prev) => prev + e.data.chunkLength);
        } else if (e.event === "Finished") {
          setStatus("installing");
        }
      });
      await relaunch();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [update]);

  useEffect(() => {
    checkForUpdate().catch(() => {});
  }, [checkForUpdate]);

  return {
    status,
    update,
    error,
    downloaded,
    total,
    checkForUpdate,
    installUpdate,
  };
}
