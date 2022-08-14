import fs from "fs";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import path from "path";

const {
    NODE_ENV,
    SERVER_MAIL_HOST: SERVER_HOST,
    SERVER_MAIL_PORT,
    SERVER_MAIL_SECURE,
    SERVER_MAIL_USER,
    SERVER_MAIL_PASS,
    DEV_FRONT_URL_ADDRESS,
    PRO_FRONT_URL_ADDRESS,
} = process.env;

const FRONT_URL_ADDRESS =
    NODE_ENV === "development" ? DEV_FRONT_URL_ADDRESS : PRO_FRONT_URL_ADDRESS;

class MailBot {
    private transporter: Transporter;

    constructor() {
        this.createTransport();
    }

    private async createTransport() {
        try {
            this.transporter = nodemailer.createTransport(
                smtpTransport({
                    host: SERVER_HOST,
                    port: parseInt(SERVER_MAIL_PORT!),
                    secure: Boolean(SERVER_MAIL_SECURE),
                    auth: {
                        user: SERVER_MAIL_USER,
                        pass: SERVER_MAIL_PASS,
                    },
                })
            );
        } catch (error: any) {
            console.log(error.message);
            setTimeout(() => {
                this.createTransport();
            }, 10000);
        }
    }
    public sendMailEmailUserVerification = (targetMail: string, token: string) => {
        const html = fs.readFileSync(
            path.resolve(__dirname, "mail-messages/email-verification-message.html"),
            "utf8"
        );
        const template = handlebars.compile(html);
        const variables = {
            endPoint: FRONT_URL_ADDRESS + "/verifyEmail/" + token,
        };
        const htmlToSend = template(variables);

        const mailOptions = {
            from: '"Bot morsujity" <morsujity@server032359.nazwa.pl>', // sender address
            to: targetMail, // list of receivers
            subject: "Zweryfikuj konto", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };

    public sendMailResetUserPassword = async (targetMail: string, token: string) => {
        const html = fs.readFileSync(
            path.resolve(__dirname, "mail-messages/password-reset-message.html"),
            "utf8"
        );
        const template = handlebars.compile(html);
        const variables = {
            endPoint: FRONT_URL_ADDRESS + "/resetPassword/" + token,
        };
        const htmlToSend = template(variables);

        const mailOptions = {
            from: '"Bot morsujity" <morsujity@server032359.nazwa.pl>', // sender address
            to: targetMail, // list of receivers
            subject: "Zresetuj Hasło", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };
}
export default MailBot;
