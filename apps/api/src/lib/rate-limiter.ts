import { prisma } from './prisma.js';
import { logger } from './logger.js';

export class RateLimiter {
  /**
   * Check if request is within rate limit
   * @param connectionId Connection ID
   * @param limitType Type of limit: per_minute, per_hour, per_day
   * @returns true if within limit, false if exceeded
   */
  static async checkLimit(
    connectionId: string,
    limitType: 'per_minute' | 'per_hour' | 'per_day'
  ): Promise<boolean> {
    try {
      // Get or create rate limit record
      const limitConfig = await this.getLimitConfig(limitType);
      
      const rateLimit = await prisma.$queryRawUnsafe(`
        INSERT INTO public.integration_rate_limits 
          (connection_id, rate_limit_type, max_requests, current_requests, window_start)
        VALUES ($1, $2, $3, 1, NOW())
        ON CONFLICT (connection_id, rate_limit_type)
        DO UPDATE SET
          current_requests = CASE
            WHEN integration_rate_limits.window_start + $4 * INTERVAL '1 second' < NOW()
            THEN 1
            ELSE integration_rate_limits.current_requests + 1
          END,
          window_start = CASE
            WHEN integration_rate_limits.window_start + $4 * INTERVAL '1 second' < NOW()
            THEN NOW()
            ELSE integration_rate_limits.window_start
          END
        RETURNING current_requests, max_requests
      `, 
        connectionId,
        limitType,
        limitConfig.maxRequests,
        limitConfig.windowSeconds
      );

      const currentRequests = rateLimit[0].current_requests;
      const maxRequests = rateLimit[0].max_requests;

      if (currentRequests > maxRequests) {
        logger.warn('Rate limit exceeded', { 
          connectionId, 
          limitType, 
          currentRequests, 
          maxRequests 
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking rate limit', { error, connectionId, limitType });
      return true; // Allow on error to avoid blocking
    }
  }

  /**
   * Get remaining requests in current window
   */
  static async getRemaining(
    connectionId: string,
    limitType: 'per_minute' | 'per_hour' | 'per_day'
  ): Promise<number> {
    try {
      const rateLimit = await prisma.$queryRawUnsafe(`
        SELECT current_requests, max_requests
        FROM public.integration_rate_limits
        WHERE connection_id = $1 AND rate_limit_type = $2
      `, connectionId, limitType);

      if (!rateLimit || rateLimit.length === 0) {
        const config = await this.getLimitConfig(limitType);
        return config.maxRequests;
      }

      const remaining = rateLimit[0].max_requests - rateLimit[0].current_requests;
      return Math.max(0, remaining);
    } catch (error) {
      logger.error('Error getting remaining requests', { error });
      return 0;
    }
  }

  /**
   * Reset rate limit for connection
   */
  static async reset(
    connectionId: string,
    limitType?: 'per_minute' | 'per_hour' | 'per_day'
  ): Promise<void> {
    try {
      if (limitType) {
        await prisma.$queryRawUnsafe(`
          UPDATE public.integration_rate_limits
          SET current_requests = 0, window_start = NOW()
          WHERE connection_id = $1 AND rate_limit_type = $2
        `, connectionId, limitType);
      } else {
        await prisma.$queryRawUnsafe(`
          UPDATE public.integration_rate_limits
          SET current_requests = 0, window_start = NOW()
          WHERE connection_id = $1
        `, connectionId);
      }

      logger.info('Rate limit reset', { connectionId, limitType });
    } catch (error) {
      logger.error('Error resetting rate limit', { error });
    }
  }

  private static getLimitConfig(limitType: string) {
    const configs = {
      per_minute: { maxRequests: 60, windowSeconds: 60 },
      per_hour: { maxRequests: 1000, windowSeconds: 3600 },
      per_day: { maxRequests: 10000, windowSeconds: 86400 }
    };

    return configs[limitType as keyof typeof configs] || configs.per_minute;
  }
}