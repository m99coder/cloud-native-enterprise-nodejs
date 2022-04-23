import Fastify from 'fastify'
import pino from 'pino'

const logger = pino({ level: 'info' })

const fastify = Fastify({
  logger: logger,
})

fastify.get('/', async (request, reply) => {
  reply.type('application/json').code(200)
  return { message: 'Hello, world' }
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err
})
