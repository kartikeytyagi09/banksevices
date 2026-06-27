import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import accountModel from "../models/account.model.js";



const createTransaction = async (req, res) => {

    //1
    const{fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({message:"fromAccount, toAccount, amount and idempotencyKey are required"});
    }

    const fromUserAccount= await accountModel.findOne({
        _id:fromAccount
    });

    const toUserAccount= await accountModel.findOne({
        _id:toAccount
    });

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            success:false,
            message:"from and to account are missing or invalid"
        })
    }

    //2 validate if the transaction with the same idempotencyKey already exists

    const isTransactionAlreadyExist= await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    });

    if(isTransactionAlreadyExist){
        if(isTransactionAlreadyExist.status==="SUCCESS"){
            return res.status(200).json({
                success:true,
                message:"Transaction already exists and is successful",
                transaction:isTransactionAlreadyExist
            })
        }

        if(isTransactionAlreadyExist.status==="PENDING"){
            return res.status(200).json({
                message:"Transaction is processing, please wait",

            })
        }

        if(isTransactionAlreadyExist.status==="FAILED"){
            return res.status(400).json({
                success:false,
                message:"Transaction is failed, please try again"
            })
        }

        if(isTransactionAlreadyExist.status=="REVERSED"){
            return res.status(500).json({
                success:false,
                message:"Transaction is reversed, please try again"
            })
        }
    }
    

}   