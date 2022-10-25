import fs from "fs";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import path from "path";
import aws from "aws-sdk";

const {
    NODE_ENV,
    SERVER_MAIL_HOST,
    SERVER_MAIL_USER,
    SERVER_MAIL_PASS,
    DEV_FRONT_URL_ADDRESS,
    PRO_FRONT_URL_ADDRESS,
} = process.env;

const FRONT_URL_ADDRESS =
    NODE_ENV === "development" ? DEV_FRONT_URL_ADDRESS : PRO_FRONT_URL_ADDRESS;

const { AWS_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_SENDER_ADDRESS } = process.env;

aws.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY,
    region: "eu-central-1",
});

class MailBot {
    private transporter!: Transporter;

    constructor() {
        this.createTransport();
    }

    private createTransport() {
        try {
            // this.transporter = nodemailer.createTransport(
            //     smtpTransport({
            //         host: SERVER_MAIL_HOST,
            //         port: 465,
            //         secure: true,
            //         auth: {
            //             user: SERVER_MAIL_USER,
            //             pass: SERVER_MAIL_PASS,
            //         },
            //     }),
            // );

            this.transporter = nodemailer.createTransport({
                SES: new aws.SES({
                    apiVersion: "2010-12-01",
                }),
            });
        } catch (e) {
            setTimeout(() => {
                this.createTransport();
            }, 10000);
        }
    }
    public sendMailEmailUserVerification = async (targetMail: string, token: string) => {
        const html = fs.readFileSync(
            path.resolve(__dirname, "mail-messages/email-verification-message.html"),
            "utf8",
        );
        const template = handlebars.compile(html);
        const variables = {
            endPoint: FRONT_URL_ADDRESS + "/auth/verify-email?token=" + token,
        };
        const htmlToSend = template(variables);

        const mailOptions = {
            from: `"Bot morsujity" <${AWS_SENDER_ADDRESS}>`, // sender address
            to: targetMail, // list of receivers
            subject: "Zweryfikuj konto", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };

    public sendMailResetUserPassword = async (targetMail: string, token: string) => {
        const html = fs.readFileSync(
            path.resolve(__dirname, "mail-messages/password-reset-message.html"),
            "utf8",
        );
        const template = handlebars.compile(html);
        const variables = {
            endPoint: FRONT_URL_ADDRESS + "/auth/new-password?token=" + token,
        };
        const htmlToSend = template(variables);

        const mailOptions = {
            from: `"Bot morsujity" <${AWS_SENDER_ADDRESS}>`, // sender address
            to: targetMail, // list of receivers
            subject: "Zresetuj Hasło", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };
}

export default MailBot;
