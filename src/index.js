const express = require('express');
const app = express();
require('./db/mongoose');
const taskRouter = require('./routers/task')
const userRouter = require('./routers/user');
const port = process.env.PORT  // provess.env is an 'environment variable'.

// app.use((req,res,next)=>{
//    res.status(503).send('Site is in maintenance mode')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter);



app.listen(port, () => {
    console.log('Server is running on port : ' + port);
})



// const myFunction = async ()=>{
//     const token = jwt.sign({_id:'abc123'},'thisistoken',{expiresIn : '1 second'})
//     console.log(token);

//     const data = jwt.verify(token,'thisistoken')
//     console.log(data);

// }
// myFunction()