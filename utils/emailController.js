//Yolife cloud dev version 13.09.20

// import nodemailer from "nodemailer";
// import crypto from 'crypto';

var gmailUser = "<email>";
var pass = "<passs>";

const emailController = {
    sendEmail: function (receiver, emailTitle, subject, text, attachments) {
        return new Promise(function (resolve, reject) {
            //     try {
            //         let transporter = nodemailer.createTransport({
            //             pool: true,
            //             service: 'gmail',
            //             host: "smtp.gmail.com",
            //             port: 465,
            //             secure: false,
            //             auth: {
            //                 user: gmailUser,
            //                 pass: pass
            //             }
            //         });

            //         var mailOptions = {
            //             from: emailTitle + " <" + gmailUser + ">",
            //             to: receiver,
            //             subject: subject,
            //             generateTextFromHTML: true,
            //             html: text,
            //             attachments: attachments
            //         };

            //         console.log('\n*** ---Send email--- ***');

            //         transporter.sendMail(mailOptions, function (error, info) {
            //             if (error) {
            //                 console.error(error);
            //                 console.log('*** ---Send email end--- ***\n')
            //                 reject(error);
            //             } else {
            //                 console.log("Send success");
            //                 console.log('*** ---Send email end--- ***\n')
            //                 resolve("Message sent: " + info.message);
            //             }
            //         });
            //     }
            //     catch (e) {
            //         console.log(e);
            //     }
            resolve(); //nodemiler node_modules errors
        });
    }
}

export default emailController;