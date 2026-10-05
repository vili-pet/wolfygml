export type KeyStatus = 'ok' | 'degraded' | 'exhausted';

export interface KeyEntry {
  label: string;
  holder: string;
  model: string;
  budgetCap: number;
  activeWindow: string;
  expires: string;
  status: KeyStatus;
  lastToggled: string;
}

export interface UsageBucket {
  date: string;
  sessionStart: string;
  sessionEnd: string;
  totalTokensMillions: number;
  tokensPerSecond: number;
  notes: string;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  errorCount: number;
  rateLimit429Count: number;
  server5xxCount: number;
  averageLatencyMs: number;
  estimatedCostSavedUsd: number;
}

export interface TelemetryData {
  telemetryUpdatedAt: string;
  costEstimateReference: string;
  keys: KeyEntry[];
  usageLog: UsageBucket[];
}
