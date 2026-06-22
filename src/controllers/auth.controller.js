import User from '../models/user.model.js';

const registerUser = async(req, res)=>{
    try{
        const {name , email, password} = req.body;
        if(!name || !email || !password){
            res.status(400).json({message:"all fields are requried"})
        }

        const userExists = await User.findOne({email});
        if(userExists){
            res.status(400).json({message:"user already exists"})
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
        res.status(201).json({
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
        res.status(500).json({message:"internal server error"})
    }
}

const loginUser=async(req, res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            res.status(422).json({message:"all fields are requried"})
        }

        const user =await User.findOne({email});
        if(!user){
            res.status(401).json({message:"invalid credentials"})
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            res.status(401).json({message:"invalid credentials"})
        }

        const token = jwt.sign({useId:user._id}, process.env.JWT_SECRET, {expiresIn:"2d"});
        res.cookie("token", token, {
            httpOnly:true, 
            sameSite:"strict",
            maxAge: 2*24*60*60*1000
        }) 

        res.status(200).json({
            user:{
                _id:user._id,
                name:user.name,
                email:user.email
            }
        })
    }catch(error){
        res.status(500).json({message:"internal server error"})
    }
}

export { registerUser ,loginUser, logoutUser, getMe };