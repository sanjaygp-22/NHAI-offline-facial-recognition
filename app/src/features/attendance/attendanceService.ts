import { AttendanceResult } from "../../types/attendance";
import { GeoLocation } from "../../types/identity";

export async function createAttendanceRecord(
  _personId: string,
  _location: GeoLocation,
  _deviceTime: string
): Promise<AttendanceResult> {
  throw new Error("Not implemented");
}
