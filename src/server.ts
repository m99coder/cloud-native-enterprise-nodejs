import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
})

fastify.get('/', async (request, reply) => {
  request.log.info(`Request method: ${request.method}`)
  reply.type('application/json').code(200)
  return { message: 'Hello, world' }
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err
})
