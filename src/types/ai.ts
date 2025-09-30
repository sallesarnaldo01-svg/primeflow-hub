export interface AISettings {
  style: {
    formality: 'casual' | 'neutral' | 'formal';
    empathy: number; // 0-10
    persona?: string;
  };
  context: {
    topics: string[];
    prohibitedTerms: string[];
    knowledgeBase?: string;
    faqDocuments?: string[];
  };
  capabilities: {
    understandImages: boolean;
    sendImages: boolean;
    transcribeAudio: boolean;
    detectEmotions: boolean;
  };
  objections: {
    enabled: boolean;
    playbook?: Array<{
      objection: string;
      response: string;
    }>;
  };
  active: boolean;
}

export interface AITestMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
