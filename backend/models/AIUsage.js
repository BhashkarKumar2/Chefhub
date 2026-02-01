import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    feature: {
        type: String,
        enum: ['menu_generation', 'chef_chat', 'recipe_gen'],
        required: true
    },
    count: {
        type: Number,
        default: 0
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    },
    resetDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to quickly find user usage per feature
aiUsageSchema.index({ user: 1, feature: 1 }, { unique: true });

export default mongoose.model('AIUsage', aiUsageSchema);
