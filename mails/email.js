require('dotenv').config();
const nodemailer = require('nodemailer')
const moment = require('moment');
const juice = require('juice');


//*Configuring NodeMail Notification for Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  port: 465,
  auth: {
    user: process.env.GMAIL_USER_NAME,
    pass: process.env.GMAIL_PASSWORD,
  }
})



function generateGoogleCalendarLink(trainingClass, location) {
  const startDate = moment(trainingClass.startDate).format('YYYYMMDDTHHmmss');
  const endDate = moment(trainingClass.endDate).format('YYYYMMDDTHHmmss');
  const eventTitle = encodeURIComponent(trainingClass.title);
  const details = encodeURIComponent("Training Class - " + trainingClass.title + "\n" + trainingClass.description);
  const eventLocation = encodeURIComponent(location);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${details}&location=${eventLocation}`;
}



async function sendConfirmationEmailForRegisteredTraningClass(user, trainingClass) {
  const googleCalendarLink = generateGoogleCalendarLink(trainingClass);

  const emailTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Include the Foundation for Emails CSS here */
      
    </style>
  </head>
  <body>
<table class="body" data-made-with-foundation>
  <tr>
    <td class="center" align="center" valign="top">
      <center>
        <table align="center" class="container">
          <tbody>
            <tr>
              <td>
                <table align="center" class="row">
                  <tbody>
                    <tr>
                      <td class="text-center">
                        <h1 style="font-weight: bold;">Congratulations!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p>You have successfully registered for the following training class:</p>
                        <table class="callout">
                          <tr>
                            <td>
                              <h3>Title: ${trainingClass.title}</h3>
                              <h3>Start Date: ${trainingClass.startDate}</h3>
                              <h3>End Date: ${trainingClass.endDate}</h3>
                            </td>
                          </tr>
                        </table>
                        <p>Thank you for registering with us. We're looking forward to seeing you in the class!</p>
                        <p><a href="${googleCalendarLink}" target="_blank" class="button">Add to Google Calendar</a></p>
                        <p>Best regards,</p>
                        <p>Tuti Hairs</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </td>
  </tr>
</table>
</body>
</html>
`;

  const inlinedTemplate = juice(emailTemplate);

  const mailOptions = {
    from: `"Tuti Hairs" <${process.env.TUTI_HAIRS_MAIL}>`,
    to: user.email,
    subject: "Training Class Registration Confirmation",
    html: inlinedTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending registration email: ', error);
    } else {
      console.log('Registration email sent: ', info.response);
    }
  });
}


async function sendOTPEmail(user, otp, token) {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const mailOptions = {
    from: `"Tuti Hair" <${process.env.TUTI_HAIRS_MAIL}>`,
    to: user.email,
    subject: "Password Reset OTP",
    html: `
      <h1>Password Reset Request</h1>
      <p>Your One-Time Password (OTP) for resetting your password is:</p>
      <h2>${otp}</h2>
      <p>Click the following link to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Please note that this OTP and link will expire in 15 minutes.</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending OTP email: ', error);
    } else {
      console.log('OTP email sent: ', info.response);
    }
  });
}

async function sendVerificationEmail(user, token) {
  const verifyLink = `http://localhost:3000/verify-email?token=${token}`;
  const mailOptions = {
    from: `"Tuti Hair" <${process.env.TUTI_HAIRS_MAIL}>`,
    to: user.email,
    subject: "Email Verification",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the following link to verify your email address:</p>
      <a href="${verifyLink}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending verification email: ', error);
    } else {
      console.log('Verification email sent: ', info.response);
    }
  });
}

async function sendOrderConfirmationEmail(userEmail, orderDetails) {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Include the Foundation for Emails CSS here */
        </style>
      </head>
      <body>
        <h1>Order Confirmation</h1>
        <p>Hello, thank you for your order. Here are the details:</p>
        <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      </body>
    </html>
  `;

  const inlinedTemplate = juice(emailTemplate);

  const mailOptions = {
    from: `"Tuti Hairs" <${process.env.TUTI_HAIRS_MAIL}>`,
    to: userEmail,
    subject: 'Order Confirmation',
    html: inlinedTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending order confirmation email: ', error);
    } else {
      console.log('Order confirmation email sent: ', info.response);
    }
  });
}


module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
  sendConfirmationEmailForRegisteredTraningClass,
  sendOrderConfirmationEmail,
}