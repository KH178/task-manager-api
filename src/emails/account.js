const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from:'karan@gmail.com',
        subject:'Thanks for joining in!',
        html:`Welcome to the app,<h1>${name}<h1>`
        
    })
}

const sendCencelationEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'karan@gamil.com',
        subject:'Sorry to see you go!',
        html:`Goodby <h1>${name}<h1>`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCencelationEmail
}
