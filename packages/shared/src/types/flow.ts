export enum NodeType {
  START = 'START',
  CONTENT = 'CONTENT',
  MENU = 'MENU',
  RANDOMIZER = 'RANDOMIZER',
  DELAY = 'DELAY',
  TICKET = 'TICKET',
  TYPEBOT = 'TYPEBOT',
  OPENAI = 'OPENAI',
  CONDITION = 'CONDITION',
  HTTP = 'HTTP',
  SCHEDULE = 'SCHEDULE',
  ASSIGN_QUEUE = 'ASSIGN_QUEUE',
  SUBFLOW = 'SUBFLOW'
}

export enum FlowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface ContentPart {
  kind: 'text' | 'image' | 'audio' | 'video' | 'document';
  value: string;
  ptt?: boolean;
  delay?: number;
}

export interface MenuOption {
  key: string;
  label: string;
  next: string;
  synonyms?: string[];
}

export interface MenuConfig {
  text: string;
  options: MenuOption[];
  captureTo?: string;
}

export interface ConditionRule {
  op: 'contains' | 'equals' | 'regex' | 'gt' | 'lt' | 'in';
  left: string;
  right: any;
  next: string;
}

export interface HttpConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  saveAs?: string;
  onErrorNext?: string;
}

export type NodeConfig =
  | { type: 'CONTENT'; parts: ContentPart[]; delay?: number }
  | { type: 'MENU'; config: MenuConfig }
  | { type: 'RANDOMIZER'; choices: Array<{ weight: number; next: string }> }
  | { type: 'DELAY'; seconds: number }
  | { type: 'TICKET'; open: true; priority?: 'low' | 'med' | 'high'; tags?: string[] }
  | { type: 'TYPEBOT'; url: string; handoffOnFinish?: string }
  | { type: 'OPENAI'; model: string; system?: string; prompt: string; temperature?: number; saveAs?: string }
  | { type: 'CONDITION'; rules: ConditionRule[]; else?: string }
  | { type: 'HTTP'; config: HttpConfig }
  | { type: 'SCHEDULE'; when: 'cron' | 'at'; cron?: string; at?: string }
  | { type: 'ASSIGN_QUEUE'; queueId: string }
  | { type: 'SUBFLOW'; flowId: string };

export interface FlowContext {
  flowId: string;
  contactId: string;
  variables: Record<string, any>;
  currentNodeId: string;
  history: string[];
}
