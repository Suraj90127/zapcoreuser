// import { months } from 'moment';
import mongoose from 'mongoose';

const rechargeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phone:{
    type:Number,
    },
    email:{
    type:String,
    },
    money: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        required: true
    },
   by: { 
    type: String, 
    default: "zapcore"
    },
    utr: {
     type: String,
    },
    network: {
        type: String,
    },
    txHash: {
        type: String,
    },
    type: { 
        type: String, 
        enum: ["recharge", "provider_buy", "cricket",],
        required: true 
    },
    providers: [
        {
        name: String,
        price: Number,
        months:Number
        }
     ],
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    id_order: {
        type: String,
        unique: true,
        required: true
    },
    providers: Array,

    months : {
        type: Number,
    },

    remarks: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

const Recharge = mongoose.model('Recharge', rechargeSchema);
export default Recharge;