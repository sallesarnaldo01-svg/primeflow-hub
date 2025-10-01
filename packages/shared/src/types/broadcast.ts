export enum BroadcastStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  DONE = 'DONE',
  FAILED = 'FAILED'
}

export interface BroadcastAction {
  type: 'message' | 'crmTab' | 'labels' | 'delay' | 'transfer';
  config: any;
}

export interface BroadcastConfig {
  intervalSec: number;
  pauseEveryN?: number;
  pauseForSec?: number;
  signature?: {
    enabled: boolean;
    customName?: string;
  };
  termsAcceptedAt?: Date;
}

export interface BroadcastStats {
  queued: number;
  sent: number;
  failed: number;
  progress: number;
}
