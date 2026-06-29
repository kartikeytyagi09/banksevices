import mongoose from "mongoose";
import accountModel from "../models/account.model";


const depositToAccount = async (req, res) => {
    const{accountId} = req.params;
    const {amount, idempotencyKey} = req.body;

    if(!amount || !idempotencyKey) {
        return res.status(400).json({message: "amount and idempotencyKey are required"});
    }

    if(typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "amount must be a positive number"
        });
    }

    const existingTransaction = await transactionModel.findOne({idempotencyKey: idempotencyKey});
    if(existingTransaction) {
        if(existingTransaction.status === "SUCCESS") {
            return res.status(200).json({
                success: true,
                message: "Transaction already exists and is successful",
                transaction: existingTransaction
            })
        }
        if(existingTransaction.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is processing, please wait",
            })
        }
        if(existingTransaction.status === "FAILED") {
            return res.status(400).json({
                success: false,
                message: "Transaction is failed, please try again"
            })
        }
        if(existingTransaction.status == "REVERSED") {
            return res.status(500).json({
                success: false,
                message: "Transaction is reversed, please try again"
            })
        }
    }

    const session= await mongoose.startSession();
    session.startTransaction();
    try{

        const account = await accountModel.findById(accountId).session(session);
        if(!account) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message: "Account not found"});
        }

        if(account.status !== "ACTIVE") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account is not active"});
        }

        const transaction = new transactionModel([{
            fromAccount: null,
            toAccount: accountId,
            amount: amount,
            idempotencyKey: idempotencyKey,
            status: "PENDING"
        }],
        {session: session});

        await ledgerModel.create(
            [{
                account: accountId,
                transaction: transaction._id,
                amount,
                type: "CREDIT"
            }],
            { session }
        );

        await accountModel.updateOne(
            { _id: accountId },
            { $inc: { balance: amount } },
            { session }
        );


        const completedTransaction = await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "SUCCESS" },
            { session, new: true }
        );

        
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Deposit successful",
            transaction: completedTransaction,
            newBalance: account.balance + amount
        })

        

    }catch(error){
        await session.abortTransaction();
        session.endSession();
        console.error("deposit failed: ", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the deposit"
        });
    }
    
}

export default depositToAccount