const mongoose = require("mongoose")

let resourceSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    visibility:{
        type:String,
        default:"public",
        enum: ["admin", "public"],
        required:true
    }
})

module.exports = mongoose.model("Resource", resourceSchema)