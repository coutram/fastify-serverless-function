import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function generateTwitterPost(campaign) {
    const prompt = `
Given the following campaign details, write a short, engaging Twitter/X post (max 280 characters) to attract the right creators. Include campaign facts and a call to action. Use emojis if appropriate.

Campaign Name: ${campaign.name}
Budget: $${campaign.budget}
Flight: ${new Date(campaign.flightStart).toLocaleDateString()} - ${new Date(campaign.flightEnd).toLocaleDateString()}
Type of KOLs: ${campaign.kolType}
Business Category: ${campaign.businessCategory}
Product/Service: ${campaign.productService}
Description: ${campaign.description}
`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.8,
    });

    console.log('OpenAI response:', response.choices[0].message.content);

    return response.choices[0].message.content.trim();
}
