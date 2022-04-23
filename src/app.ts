import Fastify, {
  FastifyReply,
  FastifySchema,
  FastifyTypeProviderDefault,
} from 'fastify'
import { RouteGenericInterface } from 'fastify/types/route'
import { Server, IncomingMessage, ServerResponse } from 'http'

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

// helper method to get the current time in milliseconds
const now = () => Date.now()

const build = (opts = {}) => {
  const app = Fastify(opts)

  app.addHook('onRequest', (req, reply: EnhancedReply, done) => {
    reply.startTime = now()
    req.log.info({ url: req.raw.url, id: req.id }, 'received request')
    done()
  })

  app.addHook('onResponse', (req, reply: EnhancedReply, done) => {
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

  app.get('/hello', () => ({ ok: true }))

  // test with:
  // curl -i http://localhost:3000/
  //   -H "Authorization: Bearer my-secret-token-that-will-not-get-logged"
  //   -H "X-Will-Get-Logged: This header will still get logged"
  app.get('/', async (req) => {
    req.log.info(
      { headers: req.headers },
      'Logging request headers for debugging …'
    )
    return { ok: true }
  })

  return app
}

export default build
