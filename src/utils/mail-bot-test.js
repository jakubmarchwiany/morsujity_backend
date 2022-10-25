/* eslint-disable @typescript-eslint/no-var-requires */
var nodemailer = require("nodemailer");
var aws = require("aws-sdk");
var fs = require("fs");

var path = require("path");
var handlebars = require("handlebars");

const AWS_ACCESS_KEY_ID = "AKIASVGWFV6STWYXWHK7";
const AWS_ACCESS_KEY = "7V4E5MnsQ4xkuhFWnMesqz3iDcyroaIH8bTHrMVO";

aws.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY,
    region: "eu-central-1",
});

let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: "2010-12-01",
    }),
});

const html = fs.readFileSync(
    path.resolve(__dirname, "mail-messages/email-verification-message.html"),
    "utf8",
);
const template = handlebars.compile(html);
const variables = {
    endPoint: "/auth/verify-email?token=",
};
const htmlToSend = template(variables);

const mailOptions = {
    from: '"Bot morsujity" <morsujity@gmail.com>', // sender address
    to: "xkvbikx@gmail.com", // list of receivers
    subject: "Zweryfikuj konto", // Subject line
    html: htmlToSend, // html body
};

transporter.sendMail(mailOptions, (err, info) => {
    console.log(err);
    // console.log(info.envelope);
    // console.log(info.messageId);
});
// send some mail
// transporter.sendMail(
//     {
//         from: "sender@example.com",
//         to: "recipient@example.com",
//         subject: "Message",
//         text: "I hope this message gets sent!",
//         ses: {
//             // optional extra arguments for SendRawEmail
//             Tags: [
//                 {
//                     Name: "tag_name",
//                     Value: "tag_value",
//                 },
//             ],
//         },
//     },
//     (err, info) => {
//         console.log(err);
//         // console.log(info.envelope);
//         // console.log(info.messageId);
//     },
// );
