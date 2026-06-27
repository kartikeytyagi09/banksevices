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
    }
},{
    timestamps:true
})

accountSchema.index({user:1}, {unique:true})

accountSchema.methods.getBalance= async function(){
    const balance = await ledgerModel.aggregate([
        {$match:{account:this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type", "DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type", "CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                balance:{$subtract:["$totalCredit", "$totalDebit"]}
            }
        }
    ])

    return balance[0]?.balance || 0;
}


const accountModel = mongoose.model("account", accountSchema);

export default accountModel;