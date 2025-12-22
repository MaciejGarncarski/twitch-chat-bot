import { env } from '@/config/env'
import { logger } from '@/helpers/logger'

export const logOnStart = async () => {
  logger.info(`Sever started, listening on ${env.API_URL}`)
}
