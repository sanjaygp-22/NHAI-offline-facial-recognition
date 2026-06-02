export type GeoLocation = {
  lat: number;
  lon: number;
  accuracyMeters?: number;
};

export type SyncResult = {
  status: "idle" | "running" | "ok" | "error";
  counts?: { uploaded: number; failed: number; purged: number };
};
