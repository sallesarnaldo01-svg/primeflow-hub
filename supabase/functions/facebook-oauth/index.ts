import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Facebook App credentials from secrets
    const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID');
    const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new Error('Facebook credentials not configured');
    }

    if (action === 'get_auth_url') {
      // Generate OAuth URL
      const scopes = [
        'pages_messaging',
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_show_list',
        'instagram_basic',
        'instagram_manage_messages',
      ].join(',');

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scopes}&` +
        `response_type=code`;

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchange_code') {
      // Exchange code for access token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `code=${code}`;

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error.message || 'Failed to exchange code');
      }

      const accessToken = tokenData.access_token;

      // Get user info
      const userResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${accessToken}&fields=id,name,email`
      );
      const userData = await userResponse.json();

      // Get user pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token`
      );
      const pagesData = await pagesResponse.json();

      // Get Instagram accounts
      const instagramAccounts: any[] = [];
      if (pagesData.data) {
        for (const page of pagesData.data) {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?` +
            `access_token=${page.access_token}&` +
            `fields=instagram_business_account`
          );
          const igData = await igResponse.json();
          
          if (igData.instagram_business_account) {
            const igAccountResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?` +
              `access_token=${page.access_token}&` +
              `fields=id,username,profile_picture_url`
            );
            const igAccountData = await igAccountResponse.json();
            
            instagramAccounts.push({
              ...igAccountData,
              pageId: page.id,
              pageAccessToken: page.access_token
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          accessToken,
          user: userData,
          pages: pagesData.data || [],
          instagramAccounts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'subscribe_webhook') {
      const { pageId, pageAccessToken } = await req.json();

      // Subscribe to webhooks
      const subscribeUrl = `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps?` +
        `subscribed_fields=messages,messaging_postbacks&` +
        `access_token=${pageAccessToken}`;

      const subscribeResponse = await fetch(subscribeUrl, { method: 'POST' });
      const subscribeData = await subscribeResponse.json();

      return new Response(
        JSON.stringify({ success: subscribeData.success }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in facebook-oauth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});