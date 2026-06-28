import mongoose from 'mongoose';
import ledgerModel from './ledger.model.js';

const accountSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true, "user is required"],
        index:true
    },

    status:{
        type:String,
        enum:["ACTIVE", "FROZEN", "CLOSED"],
        default:"ACTIVE"    
    }, 
    currency:{
        type:String, 
        required:[true,"currency is required"],
        default:"INR"
    },
    balance:{
        type:Number,
        default:0,
        min:[0, "balance must be a positive number"],
    },
    version: {
        type: Number,
        default: 0
    }       
},{
    timestamps:true
})

accountSchema.index({ user: 1 }, { unique: true })
accountSchema.index({ status: 1 })



const accountModel = mongoose.model("account", accountSchema);

export default accountModel;