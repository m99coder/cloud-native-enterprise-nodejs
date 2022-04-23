import { config } from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import build from './app'

// read port from environment variables
config()
const port = parseInt(process.env.PORT, 10) || 3000

const server = build({
  logger: {
    // redact sensitive information when logging
    // see: https://getpino.io/#/docs/redaction
    redact: {
      paths: ['headers.authorization'],
      censor: '**redacted**',
    },
  },
  // just to demonstrate the custom measurement of response time using the hooks below
  disableRequestLogging: true,
  // OpenTelemetry headers (`request-id`) are supported by default, don’t use in this case
  // see: https://www.fastify.io/docs/latest/Reference/Server/#requestidheader
  // otherwise use UUIDv4 for request IDs instead of auto-incrementing numbers
  genReqId: () => {
    return uuidv4()
  },
})

server.listen({ port }, (err) => {
  if (err) throw err
})
