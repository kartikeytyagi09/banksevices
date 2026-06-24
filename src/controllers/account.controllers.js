import accountModel from "../models/account.model.js";

// Create Account
const createAccount = async (req, res) => {
    try {
        const account = await accountModel.create({
            user: req.user._id,
            currency: req.body.currency || "INR"
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            account
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Accounts
const getUserAccounts = async (req, res) => {
    try {
        const accounts = await accountModel.find({
            user: req.user._id
        });

        return res.status(200).json({
            success: true,
            accounts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Single Account
const getAccount = async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        return res.status(200).json({
            success: true,
            account
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Balance
const getAccountBalance = async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        const balance = await account.getBalance();

        return res.status(200).json({
            success: true,
            accountId: account._id,
            balance
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Status
const updateAccountStatus = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { status } = req.body;

        if (!["ACTIVE", "FROZEN", "CLOSED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account status"
            });
        }

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        account.status = status;
        await account.save();

        return res.status(200).json({
            success: true,
            message: "Account status updated",
            account
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export {
    createAccount,
    getUserAccounts,
    getAccount,
    getAccountBalance,
    updateAccountStatus,
};