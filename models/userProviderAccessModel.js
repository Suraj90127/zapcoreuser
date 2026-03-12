import mongoose from 'mongoose';

const providerAccessSchema = new mongoose.Schema({
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
        type: [
            {
                name: {
                    type: String,
                },
                img:{
                    type:String,
                },
                path:{
                    type:String,
                },
                price:{
                    type:Number,
                },
                status: {
                    type: Number,
                    default: 0
                }
            }
        ],
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

const UserProviderAccess = mongoose.model('UserProviderAccess', providerAccessSchema);

export default UserProviderAccess;