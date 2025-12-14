import { env } from "@/config/env"
import { logger } from "@/lib/logger"

export const logOnStart = () => {
    logger.info(`Sever started, listening on ${env.API_URL}`)
}