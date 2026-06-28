import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true, "Password is required"],
        minlength:[6, "Password must be at least 6 characters long"]
    },
    role:{
        type:String,
        enum:["USER", "ADMIN"],
        default:"USER" 
    }
},
    {
        timestamps:true
    }
)

// hash the password before saving the user

userSchema.pre("save", async function(next){
        if(!this.isModified("password")){
            return next();
        }
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
})

userSchema.methods.comparePassword = async function (password) {

    console.log(password, this.password)

    return await bcrypt.compare(password, this.password)

}


const userModel= mongoose.model("user", userSchema)

export default userModel;