import dotenv from 'dotenv'
import { stdTimeFunctions } from 'pino'
import { v4 as uuidv4 } from 'uuid'

import build from './app'

// CONFIGURATION –––

// read from environment variables
dotenv.config()

type ServerConfig = {
  logLevel: string
  port: number
}

const effectiveConfig: ServerConfig = {
  logLevel: process.env.LOG_LEVEL || 'info',
  port: parseInt(process.env.PORT, 10) || 3000,
}

// SERVER –––

const server = build({
  logger: {
    level: effectiveConfig.logLevel,
    // redact sensitive information when logging
    // see: https://getpino.io/#/docs/redaction
    redact: {
      paths: ['headers.authorization'],
      censor: '**redacted**',
    },
    // print time in ISO format
    timestamp: stdTimeFunctions.isoTime,
  },
  // just to demonstrate the custom measurement of response time using the hooks in `app.ts`
  disableRequestLogging: true,
  // request ID header (`request-id`) is supported and injected up by default
  // see: https://www.fastify.io/docs/latest/Reference/Server/#requestidheader
  // otherwise use UUIDv4 for request IDs, instead of auto-incremented number
  genReqId: () => uuidv4(),
})

server.listen({ port: effectiveConfig.port }, (err) => {
  if (err) throw err

  // uncomment to test `uncaughtException` handler
  // throw new Error('Provoke uncaught exception')

  // add `EventEmitter` import and uncomment to test `uncaughtException` handler
  // new EventEmitter().emit(
  //   'error',
  //   new Error('Provoke uncaught EventEmitter error')
  // )

  // uncomment to test `unhandledRejection` handler
  // Promise.reject(new Error('Provoke unhandled rejection'))
})

// SIGNALS –––

// graceful shutdown
// begin reading from stdin so the process does not exit
process.stdin.resume()

const shutdown = (signal: string) => {
  server.log.info(`Received ${signal}`)

  // close server and respond to every new incoming request with a 503
  server.close()

  // close resources of backing services here in synchronous calls
  // …

  process.exit(0)
}

// process is killed with CTRL+C
process.on('SIGINT', shutdown)

// process is killed with SIGTERM (`kill <pid>`, `docker stop`)
process.on('SIGTERM', shutdown)

// callback for `process.exit`
process.on('exit', (code) => {
  const logMethod = code === 0 ? 'info' : 'error'
  server.log[logMethod]({ code }, `Exit with code ${code}`)
})

// EXCEPTIONS & REJECTIONS –––

const crash = (err: Error | unknown, msg: string) => {
  server.log.error({ err }, msg)
  process.exit(1)
}

// log any uncaught exception and exit in a controlled way
process.on('uncaughtException', (err: Error) =>
  crash(err, 'Uncaught exception has occured')
)

// log any unhandled rejection and exit in a controlled way
process.on('unhandledRejection', (err: unknown) =>
  crash(err, 'Unhandled rejection has occured')
)
