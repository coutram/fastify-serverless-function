import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    flightStart: { type: Date, required: true },
    flightEnd: { type: Date, required: true },
    description: { type: String, required: true },
    kolType: { type: String, required: true },
    businessCategory: { type: String, required: true },
    productService: { type: String, required: true },
    budget: { type: Number, required: true },
    campaignBrief: { type: String },
    briefGeneratedAt: { type: Date },
    briefApproved: { type: Boolean, default: false },
    briefApprovedAt: { type: Date }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', CampaignSchema);
export default Campaign;

