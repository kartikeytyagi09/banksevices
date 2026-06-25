import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true, "account is required"],
        index:true,
        immutable:true
    },
    amount :{
        type:Number,
        required:[true, "amount is required"],
        min:[0, "amount must be a positive number"],
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,    
        ref:'transaction',
        required:[true, "transaction is required"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:["CREDIT", "DEBIT"],
        required:[true, "type is required"],
        immutable:true
    }
})

const ledgerModel= mongoose.model('ledger', ledgerSchema);

export default ledgerModel;