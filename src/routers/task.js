const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const authentication = require('../middleware/authentication'); 



router.post('/tasks',authentication ,async (req, res) => {
    const task = new Task({
        ...req.body,
        owner : req.user._id
    });
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//GET /tasks?done=true
//GET /tasks?limit=2&skip=2
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', authentication ,async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.done){
        match.done = req.query.done === 'true' 
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }
    try {
        // const tasks = await Task.find({owner : req.user._id})
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate() 

        
        // if (!tasks) {
        //     return res.status(404).send()
        // }
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

// router.get('/tasks/:id',authentication ,async (req, res) => {
//     // const _id = req.params.id;
//     try {
//         const task = await Task.findOne({_id,owner : req.user._id});
//         // await req.user.populate('tasks').execPopulate();
//         if (!task) {
//             return res.status(404).send()
//         }
//         res.send(req.user.tasks)

//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

router.patch('/tasks/:id',authentication ,async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdate = ['description', 'done'];
    const isValid = updates.every((update) => {
        return allowedUpdate.includes(update)
    })

    if (!isValid) {
       return res.status(500).send('Not a valid property to update.')
    }
    const _id = req.params.id;
    try {

        const task = await Task.findOne({_id:req.params.id ,owner : req.user._id});
       
        // const task = await Task.findByIdAndUpdate(_id, req.body, {
        //     new: true,
        //     runValidators: true
        // })
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})



router.delete('/tasks/:id',authentication ,async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id:req.params.id , owner : req.user._id})
        

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//     const deleteTaskAndCount = async (id)=>{
//         const task = await Task.findByIdAndDelete(id);
//         const count = await Task.countDocuments({done : false});
//         return count
//     }
// deleteTaskAndCount('5d3c2dcc77225736e802a002').then((r)=>{
//     console.log(r);

// }).catch((e)=>{
//     console.log(e);



// Task.findByIdAndDelete('5d3c2df877225736e802a003').then((task)=>{
//     console.log(task);
//     return Task.countDocuments({done:false})
// }).then((tasks)=>{
//     console.log(tasks);
// }).catch((e)=>{
//     console.log(e);
// })


module.exports = router