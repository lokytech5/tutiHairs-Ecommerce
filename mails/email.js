require('dotenv').config();
const nodemailer = require('nodemailer')


//*Configuring NodeMail Notification for Gmail
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    auth: {
        user: process.env.GMAIL_USER_NAME,
        pass: process.env.GMAIL_PASSWORD,
    }
})


async function sendConfirmationEmailForRegisteredTraningClass(user, trainingClass) {
    const mailOptions = {
        from: `"Tuti Hairs" <${process.env.TUTI_HAIRS_MAIL}>`,
        to: user.email,
        subject: "Training Class Registration Confirmation",
        text: `Dear ${user.username}`,
        html: `<h1>Congratulations! You have successfully registered for the following training class:</h1>  
        
        <h3>Title: ${trainingClass.title}</h3>
        <h3>Start Date: ${trainingClass.startDate}</h3>
        <h3>End Date: ${trainingClass.endDate}</h3>

        <p>Thank you for registering with us. We're looking forward to seeing you in the class!</p>
        <p>Best regards,</p>
        <p>Tuti Hairs</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending registration email: ', error);
        } else {
            console.log('Registration email sent: ', info.response);
        }
    });
}

module.exports = {
    sendConfirmationEmailForRegisteredTraningClass
}