import mongoose from 'mongoose';
import { deflate } from 'zlib';

const crickeGameAccessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    totalAmount:{
        type:Number
    },
    totalPayAmount:{
        type:Number
    },
    providers: {
        type: String,
        deflate:"cricket"
    },
    isActive:{
        type:Number,
        default:0
    },
    months:{
        type:Number,
    },
    startDate:{
        type:Date
    },
    endDate:{
        type:Date,
    },
    grantedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Removed incorrect index creation for gameAccessSchema

const cricketAccess = mongoose.model('cricketAccess', crickeGameAccessSchema);

export default cricketAccess;