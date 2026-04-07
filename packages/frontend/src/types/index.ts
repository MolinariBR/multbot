export interface PlatformStatus {
  apiOnline: boolean;
  uptimeSec: number;
  bots: { activeConfigured: number; running: number };
  depix: { configured: boolean };
}