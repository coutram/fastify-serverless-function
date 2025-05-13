export default async function routes(fastify, options) {

  fastify.get('/', async (request, reply) => {
    return reply.status(200).type('text/html').send(html)
  })

  // Health check route
  fastify.get('/api/health', async (request, reply) => {
    return reply.status(200).send({ status: 'OK' });
  });

  const html = `
  <html>
    <body>
      <h1>Hello World</h1>
    </body>
  </html>
`
}

