import Fastify from 'fastify'
import dotenv from 'dotenv'
import routes from './routes.js'
import cors from '@fastify/cors'
import fastifyMongodb from '@fastify/mongodb';

dotenv.config()

const app = Fastify({
  logger: true,
})

app.get('/', async (req, reply) => {
  return reply.status(200).type('text/html').send(html)
})

// Register the CORS plugin
app.register(cors, {
  origin: '*', // Adjust this to your needs (e.g., specify allowed origins)
})

app.register(fastifyMongodb, {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,
  url: process.env.MONGO_URL
})

// Register routes
app.register(routes)

export default async function handler(req, reply) {
  await app.ready()
  app.server.emit('request', req, reply)
}

const html = `
  <html>
    <body>
      <h1>Hello World</h1>
    </body>
  </html>
`