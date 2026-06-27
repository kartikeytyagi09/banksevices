import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";



const createTransaction = async (req, res) => {

    //1
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "fromAccount, toAccount, amount and idempotencyKey are required" });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            success: false,
            message: "from and to account are missing or invalid"
        })
    }

    //2 validate if the transaction with the same idempotencyKey already exists

    const isTransactionAlreadyExist = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    if (isTransactionAlreadyExist) {
        if (isTransactionAlreadyExist.status === "SUCCESS") {
            return res.status(200).json({
                success: true,
                message: "Transaction already exists and is successful",
                transaction: isTransactionAlreadyExist
            })
        }

        if (isTransactionAlreadyExist.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is processing, please wait",

            })
        }

        if (isTransactionAlreadyExist.status === "FAILED") {
            return res.status(400).json({
                success: false,
                message: "Transaction is failed, please try again"
            })
        }

        if (isTransactionAlreadyExist.status == "REVERSED") {
            return res.status(500).json({
                success: false,
                message: "Transaction is reversed, please try again"
            })
        }
    }

    //3 check account status

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            success: false,
            message: "Both accounts must be active to perform a transaction"
        })
    }

    //4 check if the from account has sufficient balance
    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({
            success: false,
            message: `Insufficient balance in the from account, current balance: ${balance}`
        })
    }

    let transaction;
    try {
        //5 create a new transaction with status PENDING
        const session = await mongoose.startSession()
        session.startTransaction()

        const docs = await transactionModel.create(
            [{
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }],
            { session }
        );

        const transaction = docs[0];


        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 5* 1000));
        })()

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()


    } catch (error) {
        console.error("Error creating transaction:", error);    
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }

    
    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })

}   

export default createTransaction;
