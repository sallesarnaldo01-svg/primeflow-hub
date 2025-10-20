import { Job } from 'bullmq';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import crypto from 'crypto';

interface WebhookDeliveryJob {
  webhookId: string;
  eventType: string;
  payload: any;
}

export async function processWebhookDelivery(job: Job<WebhookDeliveryJob>) {
  const { webhookId, eventType, payload } = job.data;

  try {
    logger.info('Processing webhook delivery', { webhookId, eventType });

    // Get webhook configuration
    const webhook = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.webhooks WHERE id = $1
    `, webhookId);

    if (!webhook || webhook.length === 0) {
      logger.error('Webhook not found', { webhookId });
      return;
    }

    const webhookData = webhook[0];

    if (!webhookData.enabled) {
      logger.info('Webhook is disabled', { webhookId });
      return;
    }

    // Check if webhook subscribes to this event
    if (!webhookData.events.includes(eventType) && !webhookData.events.includes('*')) {
      logger.info('Webhook not subscribed to event', { webhookId, eventType });
      return;
    }

    // Prepare payload
    const webhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload
    };

    // Generate HMAC signature
    const signature = generateHmacSignature(
      webhookPayload,
      webhookData.secret || ''
    );

    // Attempt delivery with retry logic
    const retryConfig = webhookData.retry_config || {
      max_attempts: 3,
      backoff_seconds: [1, 5, 15]
    };

    let success = false;
    let lastError: string | null = null;
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let duration = 0;

    for (let attempt = 1; attempt <= retryConfig.max_attempts; attempt++) {
      const startTime = Date.now();

      try {
        logger.info('Attempting webhook delivery', { 
          webhookId, 
          attempt, 
          url: webhookData.url 
        });

        const response = await fetch(webhookData.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': eventType,
            'User-Agent': 'PrimeZap-Webhook/1.0'
          },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        duration = Date.now() - startTime;
        responseStatus = response.status;
        responseBody = await response.text();

        if (response.ok) {
          success = true;
          logger.info('Webhook delivered successfully', { 
            webhookId, 
            attempt, 
            status: responseStatus,
            duration 
          });
          break;
        } else {
          lastError = `HTTP ${responseStatus}: ${responseBody}`;
          logger.warn('Webhook delivery failed', { 
            webhookId, 
            attempt, 
            status: responseStatus 
          });
        }
      } catch (error: any) {
        duration = Date.now() - startTime;
        lastError = error.message;
        logger.error('Webhook delivery error', { 
          webhookId, 
          attempt, 
          error: error.message 
        });
      }

      // Wait before retry (exponential backoff)
      if (attempt < retryConfig.max_attempts) {
        const backoffSeconds = retryConfig.backoff_seconds[attempt - 1] || 5;
        logger.info('Waiting before retry', { webhookId, backoffSeconds });
        await new Promise(resolve => setTimeout(resolve, backoffSeconds * 1000));
      }
    }

    // Log webhook delivery attempt
    await prisma.$queryRawUnsafe(`
      INSERT INTO public.webhook_logs 
        (webhook_id, event_type, payload, response_status, response_body, 
         attempt_number, success, error_message, duration_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      webhookId,
      eventType,
      JSON.stringify(webhookPayload),
      responseStatus,
      responseBody,
      retryConfig.max_attempts,
      success,
      lastError,
      duration
    );

    if (!success) {
      logger.error('Webhook delivery failed after all retries', { 
        webhookId, 
        eventType,
        error: lastError 
      });
    }

  } catch (error) {
    logger.error('Error processing webhook delivery', { 
      webhookId, 
      eventType, 
      error 
    });
    throw error;
  }
}

function generateHmacSignature(payload: any, secret: string): string {
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  return hmac.digest('hex');
}

// Helper to emit webhook events
export async function emitWebhookEvent(
  tenantId: string,
  eventType: string,
  payload: any
) {
  try {
    // Get all webhooks subscribed to this event
    const webhooks = await prisma.$queryRawUnsafe(`
      SELECT id FROM public.webhooks
      WHERE tenant_id = $1
      AND enabled = true
      AND ($2 = ANY(events) OR '*' = ANY(events))
    `, tenantId, eventType);

    logger.info('Emitting webhook event', { 
      tenantId, 
      eventType, 
      webhooksCount: webhooks.length 
    });

    // Queue delivery for each webhook
    const { redis } = await import('../lib/redis.js');
    
    for (const webhook of webhooks) {
      await redis.publish('webhook:deliver', JSON.stringify({
        webhookId: webhook.id,
        eventType,
        payload
      }));
    }
  } catch (error) {
    logger.error('Error emitting webhook event', { error, tenantId, eventType });
  }
}