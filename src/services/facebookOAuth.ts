import { supabase } from '@/integrations/supabase/client';

export interface FacebookOAuthResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  pages: Array<{
    id: string;
    name: string;
    accessToken: string;
  }>;
  instagramAccounts: Array<{
    id: string;
    username: string;
    profilePictureUrl?: string;
    pageId: string;
    pageAccessToken: string;
  }>;
}

export const facebookOAuthService = {
  async getAuthUrl(redirectUri: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('facebook-oauth', {
      body: {
        action: 'get_auth_url',
        redirectUri
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.authUrl;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<FacebookOAuthResult> {
    const { data, error } = await supabase.functions.invoke('facebook-oauth', {
      body: {
        action: 'exchange_code',
        code,
        redirectUri
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async subscribeWebhook(pageId: string, pageAccessToken: string): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('facebook-oauth', {
      body: {
        action: 'subscribe_webhook',
        pageId,
        pageAccessToken
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.success;
  },

  // Helper to initiate OAuth flow
  initiateOAuthFlow(): Promise<void> {
    const redirectUri = `${window.location.origin}/integracoes/facebook/callback`;
    
    return this.getAuthUrl(redirectUri).then((authUrl) => {
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      window.open(
        authUrl,
        'Facebook OAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );
    });
  }
};