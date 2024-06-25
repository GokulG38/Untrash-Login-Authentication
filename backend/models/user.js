const mongoose = require("mongoose")

let userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum: ["user", "admin"], 
        default:"user",
        required:true
    }
})

module.exports = mongoose.model("User", userSchema)