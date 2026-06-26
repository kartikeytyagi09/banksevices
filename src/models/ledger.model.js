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

function preventLedgerModification(next){
    throw new Error("Ledger modification is not allowed");
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel= mongoose.model('ledger', ledgerSchema);

export default ledgerModel;