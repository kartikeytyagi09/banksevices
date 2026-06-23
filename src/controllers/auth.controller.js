import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const registerUser = async(req, res)=>{
    try{
        const {name , email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message:"all fields are requried"})
        }

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:"user already exists"})
        }
        const user =await User.create({
            name,
            email, 
            password
        })

        const token= jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"2d"});
        
        res.cookie("token", token, {
            httpOnly:true,
            sameSite:"strict",
            maxAge: 2*24*60*60*1000
        })
        
        return res.status(201).json({
            success:true,
            message:"user registered successfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            },
            token
        })

    }catch(error){
        console.log(error);
        res.status(500).json({
            message:error.message
        })
    }
}

const loginUser=async(req, res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(422).json({message:"all fields are requried"})
        }

        const user =await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"invalid credentials"})
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:"invalid credentials"})
        }

        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"2d"});
        res.cookie("token", token, {
            httpOnly:true, 
            sameSite:"strict",
            maxAge: 2*24*60*60*1000
        }) 

        return res.status(200).json({
            user:{
                _id:user._id,
                name:user.name,
                email:user.email
            }
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:error.message
        })
    }
}

const logoutUser= async(req, res)=>{
    try{
        const token = req.cookies.token || req.header.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({message:"unauthorized"})
        }

        await tokenBlacklist.create({ token });
        res.clearCookie('token');

        return res.status(200).json({
            success:true,
            message:"user logout successfully "
        })
    }catch(error){
        return res.status(500).json({message:"internal server error"})
    }
    
}

export { registerUser ,loginUser, logoutUser};