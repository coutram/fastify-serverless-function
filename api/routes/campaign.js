import Campaign from '../models/campaign.js'
import { generateCampaignBrief, generateTwitterPost } from '../services/openaiService.js'
import { uploadToStorage } from '../utils/storage.js'
import User from '../models/user.js'
import multipart from '@fastify/multipart'

export default async function routes(fastify, options) {

  // Register multipart plugin
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1
    },
    attachFieldsToBody: true
  });

  // Create a new campaign first, then generate brief asynchronously
  fastify.post('/api/campaigns', async (request, reply) => {
    try {
      // Handle regular JSON data
      const campaignData = request.body;

      const campaign = new Campaign(campaignData);
      const savedCampaign = await campaign.save();
      reply.code(201).send(savedCampaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
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
      const twitterPost = await generateTwitterPost(campaign);
      
      // Update campaign with the new brief and reset approval
      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaign._id,
        {
          campaignBrief: brief,
          twitterPost,
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
      const campaignId = request.params.id;
      
      // Handle regular JSON update
      const updateData = request.body;

      const campaign = await Campaign.findByIdAndUpdate(
        campaignId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }
      reply.send(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
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


  // Get all campaigns
  fastify.get('/api/campaigns/invited/:walletId', async (request, reply) => {
    try {
      const user = await User.findOne({ walletId: request.params.walletId });
      const campaigns = await Campaign.find({ applicants: { $in: [user._id] } });
      reply.send(campaigns);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });


  // Apply to a campaign
  fastify.post('/api/campaigns/:id/apply', async (request, reply) => {
    try {
      const campaignId = request.params.id;
      const { userId } = request.body; // The applicant's user ID

      // Optionally, check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Add user to applicants if not already applied
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }
      if (campaign.applicants.includes(userId)) {
        return reply.code(400).send({ error: 'Already applied' });
      }

      campaign.applicants.push(userId);
      await campaign.save();

      reply.send({ success: true, campaign });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update campaign icon
  fastify.put('/api/campaigns/:id/icon', async (request, reply) => {
    try {
      console.log('About to get file...');
      const data = await request.file();
      console.log('File:', data);

      console.log('About to get buffer...');
      const buffer = await data.toBuffer();
      console.log('Buffer:', buffer);

      console.log('About to upload to S3...');
      const s3Result = await uploadToStorage(buffer, data.filename, data.mimetype);
      console.log('S3 result:', s3Result);

      // Send response and return immediately
      return reply.send({ status: 'success', url: s3Result.url });
    } catch (err) {
      console.error('Error in icon upload route:', err);
      // Only send error if response not already sent
      if (!reply.raw.writableEnded) {
        return reply.status(500).send({ error: err.message });
      }
      // Otherwise, just log the error
    }
  });

  fastify.setErrorHandler(function (error, request, reply) {
    console.error('Fastify error handler:', error);
    if (!reply.raw.writableEnded) {
      reply.status(500).send({ error: error.message });
    }
  });

}
