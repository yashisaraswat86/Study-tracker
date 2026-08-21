const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    type:{
        type:String,
        enum:["daily","weekly"],
        required:true
    },

    target:{
        type:Number,
        required:true
        // Target study time in seconds
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Goal",goalSchema);