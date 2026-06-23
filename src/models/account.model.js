import mongoose from 'mongoose';

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
    }
},{
    timestamps:true
})

accountSchema.index({user:1}, {unique:true})

const accountModel = mongoose.model("account", accountSchema);