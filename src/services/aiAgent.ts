import { supabase } from '@/integrations/supabase/client';

export interface AIAgentConfig {
  id: string;
  systemPrompt: string;
  capabilities: string[];
  actions: string[];
}

export interface AIAgentExecuteRequest {
  conversationId: string;
  message: string;
  agentConfig: AIAgentConfig;
}

export interface AIAgentResponse {
  response: string;
  actionExecuted?: {
    type: string;
    success: boolean;
    data?: any;
    error?: string;
  };
  knowledgeUsed: boolean;
}

export const aiAgentService = {
  async execute(request: AIAgentExecuteRequest): Promise<AIAgentResponse> {
    const { data, error } = await supabase.functions.invoke('ai-agent-execute', {
      body: request
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async testAgent(agentConfig: AIAgentConfig, testMessage: string): Promise<AIAgentResponse> {
    const mockConversationId = 'test-conversation';
    
    return this.execute({
      conversationId: mockConversationId,
      message: testMessage,
      agentConfig
    });
  }
};