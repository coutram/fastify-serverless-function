import Campaign from '../models/campaign.js'
import { generateCampaignBrief } from '../services/openaiService.js'

export default async function routes(fastify, options) {

  // Create a new campaign first, then generate brief asynchronously
  fastify.post('/api/campaigns', async (request, reply) => {
    try {
      const campaignData = request.body;
      const campaign = new Campaign(campaignData);
      
      // Save the campaign immediately
      const savedCampaign = await campaign.save();
      
      // Generate brief asynchronously
      generateCampaignBrief(savedCampaign)
        .then(async (brief) => {
          // Update the campaign with the generated brief
          await Campaign.findByIdAndUpdate(savedCampaign._id, {
            campaignBrief: brief,
            briefGeneratedAt: new Date()
          });
        })
        .catch(error => {
          console.error('Error generating brief:', error);
          // You might want to log this error or handle it in some way
        });

      // Return the saved campaign immediately
      reply.code(201).send(savedCampaign);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get campaign with brief status
  fastify.get('/api/campaigns/:id', async (request, reply) => {
    try {
      const campaign = await Campaign.findById(request.params.id);
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }
      
      // Include brief generation status in response
      const response = {
        ...campaign.toObject(),
        briefStatus: campaign.campaignBrief ? 'completed' : 'generating'
      };
      
      reply.send(response);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Generate brief for an existing campaign
  fastify.post('/api/campaigns/:id/generate-brief', async (request, reply) => {
    try {
      const campaign = await Campaign.findById(request.params.id);
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }

      // Generate brief synchronously
      const brief = await generateCampaignBrief(campaign);
      
      // Update campaign with the new brief and reset approval
      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaign._id,
        {
          campaignBrief: brief,
          briefGeneratedAt: new Date(),
          briefApproved: false,
          briefApprovedAt: null
        },
        { new: true }
      );

      // Return the updated campaign
      reply.send(updatedCampaign);
    } catch (error) {
      console.error('Error generating brief:', error);
      reply.code(500).send({ error: error.message });
    }
  });

  // Get brief generation status
  fastify.get('/api/campaigns/:id/brief-status', async (request, reply) => {
    try {
      const campaign = await Campaign.findById(request.params.id);
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }

      reply.send({
        briefStatus: campaign.campaignBrief ? 'completed' : 'generating',
        briefGeneratedAt: campaign.briefGeneratedAt,
        hasBrief: !!campaign.campaignBrief
      });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get all campaigns
  fastify.get('/api/campaigns', async (request, reply) => {
    try {
      const campaigns = await Campaign.find();
      reply.send(campaigns);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update campaign
  fastify.put('/api/campaigns/:id', async (request, reply) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true }
      );
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }
      reply.send(campaign);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Delete campaign
  fastify.delete('/api/campaigns/:id', async (request, reply) => {
    try {
      const campaign = await Campaign.findByIdAndDelete(request.params.id);
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }
      reply.send({ message: 'Campaign deleted successfully' });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Approve brief for an existing campaign
  fastify.post('/api/campaigns/:id/approve-brief', async (request, reply) => {
    try {
      const campaign = await Campaign.findById(request.params.id);
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }

      if (!campaign.campaignBrief) {
        return reply.code(400).send({ error: 'No brief generated yet' });
      }

      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaign._id,
        {
          briefApproved: true,
          briefApprovedAt: new Date()
        },
        { new: true }
      );

      reply.send(updatedCampaign);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

}
