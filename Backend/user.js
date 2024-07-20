import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type: String
    },
    password:{
        type: String
    },
    email:{
        type: String
    }
})

const user = mongoose.model("user", userSchema);
export default user;
    