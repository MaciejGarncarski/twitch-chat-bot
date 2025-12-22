import pino from 'pino'

const pinoEnvOptions: Record<'development' | 'production', pino.Logger> = {
  development: pino({
    enabled: true,
    useOnlyCustomLevels: false,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname,headers,log,set',
      },
    },
  }),
  production: pino({
    level: 'info',
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
  }),
}

export const logger =
  pinoEnvOptions[process.env.NODE_ENV === 'production' ? 'production' : 'development']
