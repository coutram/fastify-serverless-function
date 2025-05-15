import mongoose from 'mongoose';

const TweetSchema = new mongoose.Schema({
  twitterUserId: { type: String, required: true, index: true },
  tweetId: { type: String, required: true, unique: true },
  text: String,
  createdAt: Date,
  // Add more fields as needed (e.g., media, retweet count, etc.)
});

const Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
