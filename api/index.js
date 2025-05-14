import Fastify from 'fastify'
import dotenv from 'dotenv'

import cors from '@fastify/cors'
import { connectDB } from './mongo.js'

import routes from './routes.js'
import userRoutes from './routes/user.js'
import campaignRoutes from './routes/campaign.js'

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

// Register routes
app.register(routes)
app.register(userRoutes)
app.register(campaignRoutes)

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
  try {
    await connectDB(); // Connect to the database
    await app.ready(); // Ensure the Fastify app is ready
    app.server.emit('request', req, reply); // Emit the request to the Fastify server
} catch (error) {
    console.error('Error in handler:', error);
    reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
}
}

