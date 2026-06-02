export type LivenessResult = {
  status: "pass" | "fail" | "retry";
  passiveScore?: number;
  blinkDetected?: boolean;
};
