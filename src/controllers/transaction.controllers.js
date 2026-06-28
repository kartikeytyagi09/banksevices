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

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "amount must be a positive number"
        });
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


    //3 start sesession and transaction    
    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        // ─── 4. Read Accounts
        const [fromUserAccount, toUserAccount] = await Promise.all([
            accountModel.findById(fromAccount).session(session),
            accountModel.findById(toAccount).session(session)
        ]);

        if (!fromUserAccount || !toUserAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "One or both accounts not found"
            });
        }

        //5 check account status

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Both accounts must be active to perform a transaction"
            })
        }

        //6 check balance

        if (fromUserAccount.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Insufficient balance in the fromAccount"
            })
        }


        //7 create a new transaction with status PENDING
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

        //8 debit and credit ledger entries
        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        // await (() => {
        //     return new Promise((resolve) => setTimeout(resolve, 5 * 1000));
        // })()

        // 9 Update Sender Balance
        await accountModel.updateOne(
            { _id: fromAccount },
            { $inc: { balance: -amount } },
            { session }
        );

        //11 Update Receiver Balance
        await accountModel.updateOne(
            { _id: toAccount },
            { $inc: { balance: amount } },
            { session }
        );

        // 12. Update Transaction 
        const completedTransaction = await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "SUCCESS" },
            { session, new: true }
        );

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            success: true,
            message: "Transaction completed successfully",
            transaction: completedTransaction
        })


    } catch (error) {
        console.error("Error creating transaction:", error);
        return res.status(400).json({
            success: false,
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }


}

export default createTransaction;
