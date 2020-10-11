//============
//HOUSE MODEL//
//============

//import the database and the User model
import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    price:{
        type:String,
        required: true
    },
    image:{
        type: String  
    },
    category:{
        type:String,
        required: true
    },
    description:{
        type:String,
        required: true
    },
    status:{
        type:String,
        required: true
    },
    features:[{type: String}],
    location:{
        type:String,
        required: true
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            red: 'User'
        },
        username: String
    }
});

//Export the house model 
export default mongoose.model('Property', PropertySchema);