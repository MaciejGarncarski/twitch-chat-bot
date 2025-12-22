import { LRUCache } from 'lru-cache'

export type RateLimitConfig = {
  windowMs: number
  max: number
  blockDurationMs?: number
}

type RateLimitState = {
  count: number
  resetAt: number
  blockedUntil?: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
  retryIn?: number
  blockedUntil?: number
}

export class RateLimiter {
  private cache: LRUCache<string, RateLimitState>
  private defaultConfig: RateLimitConfig

  constructor(defaultConfig: RateLimitConfig, maxEntries = 5000) {
    this.defaultConfig = defaultConfig
    this.cache = new LRUCache<string, RateLimitState>({
      max: maxEntries,
      ttl: defaultConfig.windowMs,
      allowStale: false,
    })
  }

  check(key: string, overrideConfig?: RateLimitConfig): RateLimitResult {
    const config = overrideConfig ?? this.defaultConfig
    const now = Date.now()

    const existing = this.cache.get(key)

    if (existing?.blockedUntil && now < existing.blockedUntil) {
      const retryIn = existing.blockedUntil - now

      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
        retryIn,
        blockedUntil: existing.blockedUntil,
      }
    }

    let state = existing

    if (!state || now >= state.resetAt) {
      state = {
        count: 0,
        resetAt: now + config.windowMs,
      }
    }

    if (state.count >= config.max) {
      const blockedUntil = config.blockDurationMs
        ? Math.max(state.resetAt, now + config.blockDurationMs)
        : state.resetAt

      const retryIn = blockedUntil - now
      this.cache.set(key, { ...state, blockedUntil }, { ttl: retryIn })

      return {
        allowed: false,
        remaining: 0,
        resetAt: state.resetAt,
        retryIn,
        blockedUntil,
      }
    }

    const updatedState: RateLimitState = {
      ...state,
      count: state.count + 1,
    }

    this.cache.set(key, updatedState, {
      ttl: Math.max(updatedState.resetAt - now, 0),
    })

    return {
      allowed: true,
      remaining: config.max - updatedState.count,
      resetAt: updatedState.resetAt,
    }
  }

  reset(key: string) {
    this.cache.delete(key)
  }
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 2000,
  max: 5,
}

export const rateLimiter = new RateLimiter(DEFAULT_RATE_LIMIT)
