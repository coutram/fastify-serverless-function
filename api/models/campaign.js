import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    flightStart: { type: Date, required: true },
    flightEnd: { type: Date, required: true },
    description: { type: String, required: true },
    kolType: { type: String, required: true },
    businessCategory: { type: String, required: true },
    productService: { type: String, required: true },
    budget: { type: Number, required: true },
    icon: { type: String, required: false },
    twitterPost: { type: String },
    emailContent: { type: String },
    campaignBrief: { type: String },
    briefGeneratedAt: { type: Date },
    briefApproved: { type: Boolean, default: false },
    briefApprovedAt: { type: Date },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;

