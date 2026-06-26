import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

async function protect(req, res, next) {
    const token= req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message:"unauthorized"})
    }


    try{
        const decode= jwt.verify(token, process.env.JWT_SECRET);
        const user= await User.findById(decode.userId).select("-password");

        if(!user){
            return res.status(401).json({message:"unauthorized"})
        }

        req.user= user;
        next();
    } catch (error) {
        return res.status(401).json({message:"unauthorized"})
    }
}

export { protect };