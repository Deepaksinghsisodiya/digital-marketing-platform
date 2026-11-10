export interface HealthLiveResponse {
  status: "Healthy" | "Unhealthy" | string;
  timestamp: string;
  service: string;
}

export interface HealthCheckEntry {
  key: string;
  status: "Healthy" | "Degraded" | "Unhealthy" | string;
  durationMs: number;
  description: string;
}

export interface HealthReadyResponse {
  status: "Healthy" | "Degraded" | "Unhealthy" | string;
  totalDurationMs: number;
  entries: HealthCheckEntry[];
}
