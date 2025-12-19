import { env } from "@/config/env";
import { logger } from "@/helpers/logger";

export const logOnStart = async () => {
  logger.info(`Sever started, listening on ${env.API_URL}`);
  logger.info(`\n${ascii}`);
};

const ascii =
  "  _____________    __                        \r\n /_  __/_  __/ |  / /                        \r\n  / /   / /  | | / /                         \r\n / /   / /   | |/ /                          \r\n/_/___/_/    |___/                           \r\n  / ___/____  ____  ____ _                   \r\n  \\__ \\/ __ \\/ __ \\/ __ `/                   \r\n ___/ / /_/ / / / / /_/ /                    \r\n/____/\\____/_/ /_/\\__, /                  __ \r\n   / __ \\___  ___/____/ ___  _____  _____/ /_\r\n  / /_/ / _ \\/ _ \\/ __ `/ / / / _ \\/ ___/ __/\r\n / _, _/  __/  __/ /_/ / /_/ /  __(__  ) /_  \r\n/_/ |_|\\___/\\___/\\__, /\\__,_/\\___/____/\\__/  \r\n                   /_/                       ";
