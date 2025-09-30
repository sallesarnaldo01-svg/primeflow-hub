export interface Integration {
  id: string;
  provider: 'whatsapp' | 'facebook' | 'instagram';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSyncAt?: string;
  config?: {
    pages?: Array<{ id: string; name: string; selected: boolean }>;
    profiles?: Array<{ id: string; username: string; selected: boolean }>;
    numbers?: Array<{ id: string; number: string; selected: boolean }>;
  };
  error?: string;
}

export interface IntegrationStatus {
  provider: string;
  connected: boolean;
  accounts: number;
  lastSync?: string;
}
