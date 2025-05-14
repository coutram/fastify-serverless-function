import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateCampaignBrief(campaign) {
    try {
        const prompt = `Create a compelling campaign brief for the following campaign:
        
Campaign Name: ${campaign.name}
Description: ${campaign.description}
Type of KOLs: ${campaign.kolType}
Business Category: ${campaign.businessCategory}
Product/Service: ${campaign.productService}
Budget: $${campaign.budget}
Flight Period: ${campaign.flightStart} to ${campaign.flightEnd}

Please create a brief that:
1. Highlights the key selling points of the campaign
2. Explains what we're looking for in creators
3. Outlines the campaign goals and expectations
4. Includes any specific requirements or guidelines
5. Makes it attractive for creators to participate

Format the brief in a clear, professional, and engaging way.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional campaign strategist who creates compelling briefs for influencer marketing campaigns."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        console.log('OpenAI response:', completion.choices[0].message.content);

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error generating campaign brief:', error);
        throw new Error(`Failed to generate campaign brief: ${error.message}`);
    }
}
