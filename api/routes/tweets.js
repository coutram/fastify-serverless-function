import axios from 'axios';
import Tweet from '../models/tweet.js'; // adjust path as needed

export default async function routes(fastify, options) {
    fastify.get('/api/tweets/:twitterHandle', async (request, reply) => {
      const { twitterHandle } = request.params;; // or request.query

      const tweets = await Tweet.find({ twitterUserId: twitterHandle }).sort({ createdAt: -1 });

      if (tweets.length > 0) {
        return reply.json(tweets);
      }

      const bearerToken = process.env.TWITTER_BEARER_TOKEN;

      try {
        // 1. Get user ID from handle
        console.log('Calling Twitter API for user:', `https://api.twitter.com/2/users/by/username/${twitterHandle}`,);
        const userRes = await axios.get(
          `https://api.twitter.com/2/users/by/username/${twitterHandle}`,
          { headers: { Authorization: `Bearer ${bearerToken}` } }
        );
        const userId = userRes.data.data?.id;
        if (!userId) return reply.status(404).json({ error: 'User not found' });

        // 2. Get tweets for user ID
        console.log('Calling Users Tweets API for user:', `https://api.twitter.com/2/users/${userId}/tweets`);
      
        const tweetsRes = await axios.get(
          `https://api.twitter.com/2/users/${userId}/tweets`,
          { headers: { Authorization: `Bearer ${bearerToken}` } }
        );
        const tweetsData = tweetsRes.data.data || [];

        // 3. Store tweets in MongoDB
        await storeUserTweets(userId, tweetsData);

        reply.json(tweetsData);
      } catch (error) {
        console.error(error);
        reply.status(500).json({ error: 'Failed to fetch or store tweets' });
      }
    });
}

async function storeUserTweets(twitterUserId, tweets) {
  for (const tweet of tweets) {
    // Try both 'created_at' and 'createdAt' fields, fallback to null if not present
    const rawDate = tweet.created_at || tweet.createdAt || null;
    const parsedDate = rawDate ? new Date(rawDate) : null;
    // Only use parsedDate if it's valid
    const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.valueOf());

    if (!isValidDate) {
      console.warn(`Invalid date for tweet ${tweet.id}:`, rawDate);
    }

    await Tweet.updateOne(
      { tweetId: tweet.id },
      {
        twitterUserId,
        tweetId: tweet.id,
        text: tweet.text,
        createdAt: isValidDate ? parsedDate : undefined, // or omit if invalid
      },
      { upsert: true }
    );
  }
}

