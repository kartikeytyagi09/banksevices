import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:false,
        default:null
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true, "toAccount is required"]
    },
    amount:{
        type:Number,
        required:[true, "amount is required"],
        min:[0, "amount must be greater than 0"]
    },
    status:{
        type:String,
        enum:["SUCCESS", "FAILED", "PENDING","REVERSED"],
        default:"PENDING"
    },
    idempotencyKey:{
        type:String,
        required:[true,"idempotencyKey is required"],
        index:true,
        unique:true
    }
},{
        timestamps:true
    }
);
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;