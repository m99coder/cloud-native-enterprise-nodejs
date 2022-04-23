import { v4 as uuidv4 } from 'uuid'
import build from './app'

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

server.listen({ port: 3000 }, (err) => {
  if (err) throw err
})
