// "use strict";
import fs from "fs";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import path from "path";

const {
    NODE_ENV,
    SERVER_HOST,
    SERVER_MAIL_PORT,
    SERVER_MAIL_SECURE,
    SERVER_MAIL_USER,
    SERVER_MAIL_PASS,
    DEV_FRONT_URL_ADDRESS,
    PRO_FRONT_URL_ADDRESS,
} = process.env;

let url: string;
if (NODE_ENV === "development") url = DEV_FRONT_URL_ADDRESS;
if (NODE_ENV === "production") url = PRO_FRONT_URL_ADDRESS;

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
        let html = fs.readFileSync(
            path.resolve(__dirname, "mailMessages/emailVerification.html"),
            "utf8"
        );

        let template = handlebars.compile(html);

        let variables = {
            endPoint: url + "/verifyEmail/" + token,
        };

        let htmlToSend = template(variables);

        let mailOptions = {
            from: '"Bot morsujity" <morsujity@server032359.nazwa.pl>', // sender address
            to: targetMail, // list of receivers
            subject: "Zweryfikuj konto", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };

    public sendMailResetUserPassword = async (targetMail: string, token: string) => {
        let html = fs.readFileSync(
            path.resolve(__dirname, "mailMessages/passwordReset.html"),
            "utf8"
        );

        let template = handlebars.compile(html);

        let variables = {
            endPoint: url + "/resetPassword/" + token,
        };

        let htmlToSend = template(variables);

        let mailOptions = {
            from: '"Bot morsujity" <morsujity@server032359.nazwa.pl>', // sender address
            to: targetMail, // list of receivers
            subject: "Zresetuj Hasło", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };
}

export default MailBot;
