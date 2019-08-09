const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const sharp = require('sharp'); 
const sendEmail = require('../emails/account');
const authentication = require('../middleware/authentication');
const multer = require('multer');
const upload = multer({
    limits:{
        fileSize:1500000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload correct format!'))
        }
        cb(undefined,true)
    }
})



router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendEmail.sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/me/avatar',authentication,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
// req.user.avatar = req.file.buffer
req.user.avatar = buffer;
await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
    // next()
})

router.delete('/users/me/avatar',authentication,async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send(req.user)
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('No user found!')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)

    }catch(e){
      res.status(400).send('Error')
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(400).send('Please enter valid request!')
    }
})

router.post('/users/logout',authentication ,async (req,res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',authentication,async(req,res)=>{
    try{
        req.user.tokens = [];     
    await req.user.save() 
    res.send()
    }
    catch(e){
        res.status(500).send()
}
})


//get users
router.get('/users/me', authentication, async (req, res) => {
    res.send(req.user)
})


// //get target user 
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)

//     } catch (error) {
//         res.status(500).send(error)
//     }
// })
//update target user
router.patch('/users/me',authentication ,async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdate = ['name', 'password', 'age', 'email'];
    const isValid = updates.every((update) => {
        return allowedUpdate.includes(update)
    })

    if (!isValid) {
       return res.status(500).send('Not a valid property to update.')
    }
    try {
        const user = req.user;
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        await user.save();


        // const user = await User.findByIdAndUpdate(_id, req.body, {
        //     new: true,
        //     runValidators: true
        // })
        // if (!user) {
        //     return res.status(404).send()
        // }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    } 

})

router.delete('/users/me',authentication ,async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)

        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove();
        sendEmail.sendCencelationEmail(req.user.email,req.user.name);
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})





module.exports = router
