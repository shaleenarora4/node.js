var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    mobile: {
        type: String,
        required: true,
        unique:true
    },
    pass: {
        type: Number,
        required: true
    },
    name:{
        type:String,
        required:false
    },
    age:{
        type:Number,
        required:false
    },
    city:{
        type:String,
    }
});

var User = mongoose.model("user", UserSchema);

// Export model
module.exports = User;