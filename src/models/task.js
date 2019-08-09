const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    done:{
        type:Boolean,
        default:false
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
},{
    timestamps : true
})

taskSchema.pre('save',async function(){
    console.log('Task is saved or added');
    
})
const Task = mongoose.model('Task',taskSchema)

module.exports = Task;