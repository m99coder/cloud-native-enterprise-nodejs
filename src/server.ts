import Fastify, {
  FastifyReply,
  FastifySchema,
  FastifyTypeProviderDefault,
} from 'fastify'
import { RouteGenericInterface } from 'fastify/types/route'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { v4 as uuidv4 } from 'uuid'

const server = Fastify({
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

const now = () => Date.now()

// enhance type by `startTime` property
interface EnhancedReply
  extends FastifyReply<
    Server,
    IncomingMessage,
    ServerResponse,
    RouteGenericInterface,
    unknown,
    FastifySchema,
    FastifyTypeProviderDefault,
    unknown
  > {
  startTime: number
}

server.addHook('onRequest', (req, reply: EnhancedReply, done) => {
  reply.startTime = now()
  req.log.info({ url: req.raw.url, id: req.id }, 'received request')
  done()
})

server.addHook('onResponse', (req, reply: EnhancedReply, done) => {
  req.log.info(
    {
      url: req.raw.url,
      statusCode: reply.raw.statusCode,
      durationMs: now() - reply.startTime,
    },
    'request completed'
  )
  done()
})

server.get('/hello', () => ({ ok: true }))

// test with:
// curl -i http://localhost:3000/
//   -H "Authorization: Bearer my-secret-token-that-will-not-get-logged"
//   -H "X-Will-Get-Logged: This header will still get logged"
server.get('/', async (req) => {
  req.log.info(
    { headers: req.headers },
    'Logging request headers for debugging …'
  )
  return { ok: true }
})

server.listen({ port: 3000 }, (err) => {
  if (err) throw err
})
