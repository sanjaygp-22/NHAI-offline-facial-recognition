export type AttendanceResult = {
  status: "ok" | "geofence_failed" | "duplicate" | "error";
  recordId?: string;
};
