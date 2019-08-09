const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');



const userSchema = new mongoose.Schema({
    name: {
         type : String,
         required : true,
         trim : true
    },
    age : {
        type : Number,
        default : 0,
        max : 100,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    email : { 
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid');
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 6, 
        validate(value){
            // let reg = value.match(/password/i) 
            // console.log(reg);
            
            if(value.toLowerCase().includes('password')){
                throw new Error('Password is too common!');
            }
            if(value.length < 6){
                throw new Error('Password is too Short!');
            }
            
        }
    },
    tokens :[{
        token : {
            type : String,
            required :true
        }
    }],avatar:{
        type:Buffer
    }

},
{
    timestamps : true
}
)

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function(){
    const user= this;
    const userObject = user.toObject();

    delete userObject.tokens;
    delete userObject.password;
    delete userObject.avatar;

    return userObject;
}


userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id : this._id.toString()},process.env.JWT_SECRET);
    this.tokens = this.tokens.concat( { token })
    await this.save();
    return token;
}       

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })    
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})
//Delete user tasks when user is removed
userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner : user._id})
})
const User = mongoose.model('User',userSchema)


module.exports = User;