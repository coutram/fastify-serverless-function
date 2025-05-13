import CampaignModel from '../models/campaign.js'

export default async function routes(fastify, options) {

  // Create an instance of UserModel after MongoDB is ready
  let campaign;

  fastify.after(() => {
    campaign = new CampaignModel(fastify.mongo.client);
  });

  fastify.post('/api/campaigns', async (request, reply) => {
    const { name, flightStart, flightEnd, description, kolType, businessCategory, productService } = request.body;
    const newCampaign = new Campaign(name, flightStart, flightEnd, description, kolType, businessCategory, productService);
    const result = await campaign.save(newCampaign);
    reply.send(result);
  });

  fastify.get('/api/campaigns', async (request, reply) => {
    const result = await campaign.getAll();
    reply.send(result);
  }); 

  fastify.get('/api/campaigns/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await campaign.getById(id);
    reply.send(result);
  });

  fastify.put('/api/campaigns/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, flightStart, flightEnd, description, kolType, businessCategory, productService } = request.body;
    const result = await campaign.update(id, { name, flightStart, flightEnd, description, kolType, businessCategory, productService });
    reply.send(result);
  });

  fastify.delete('/api/campaigns/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await campaign.delete(id);
    reply.send(result);
  });
  
  
}
