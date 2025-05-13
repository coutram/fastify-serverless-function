import Fastify from 'fastify'
import dotenv from 'dotenv'
import routes from './routes.js'
import cors from '@fastify/cors'
import fastifyMongodb from '@fastify/mongodb';

dotenv.config()

const app = Fastify({
  logger: true,
})

// Register the CORS plugin
app.register(cors, {
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
});

app.register(fastifyMongodb, {
  // force to close the mongodb connection when app stopped
  // the default value is false
  forceClose: true,
  url: process.env.MONGO_URL
})

// Register routes
app.register(routes)

// Set default content type for all responses
app.addHook('onSend', (request, reply, payload, done) => {
    reply.header('Content-Type', 'application/json');
    done();
});

app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
        error: error.message || 'Internal Server Error',
    });
});

export default async function handler(req, reply) {
  await app.ready()
  app.server.emit('request', req, reply)
}

