import Fastify from 'fastify'

const fastify = Fastify({
  logger: {
    name: 'typescript-vscode',
    level: 'info',
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    messageKey: 'message',
  },
})

fastify.get('/', async (request, reply) => {
  request.log.info(`Request method: ${request.method}`)
  reply.type('application/json').code(200)
  return { message: 'Hello, world' }
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err
})
