import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    base: isProduction ? null : { pid: false, hostname: false },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: !isProduction
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  messageFormat: '[{time}]: {msg}'
              }
          }
        : undefined
});
