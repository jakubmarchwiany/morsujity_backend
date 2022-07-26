// "use strict";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import * as smtpTransport from "nodemailer-smtp-transport";

const {
    ENV,
    SERVER_HOST,
    SERVER_MAIL_PORT,
    SERVER_MAIL_SECURE,
    SERVER_MAIL_USER,
    SERVER_MAIL_PASS,
    DEV_FRONT_URL_ADDRESS,
    PRO_FRONT_URL_ADDRESS,
} = process.env;

class MailBot {
    private transporter!: Transporter;
    private url: string;

    constructor() {
        this.createTransport();
        if (ENV == "development") {
            this.url = DEV_FRONT_URL_ADDRESS!;
        } else {
            this.url = PRO_FRONT_URL_ADDRESS!;
        }
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
        } catch (error) {
            setTimeout(() => {
                this.createTransport();
            }, 10000);
        }
    }
    public sendMailEmailUserVerification = async (targetMail: string, token: string) => {
        try {
            let html = fs.readFileSync("./utils/mailMessages/emailVerification.html", "utf8");
            let template = handlebars.compile(html);

            let variables = {
                endPoint: this.url + "/verifyEmail/" + token,
            };

            let htmlToSend = template(variables);

            let mailOptions = {
                from: '"Bot morsujity" <bot@morsujity.pl>', // sender address
                to: targetMail, // list of receivers
                subject: "Zweryfikuj konto", // Subject line
                html: htmlToSend, // html body
            };

            this.transporter.sendMail(mailOptions);
        } catch (error: any) {
            setTimeout(() => {
                this.sendMailEmailUserVerification(targetMail, token);
            }, 10000);
        }
    };

    public sendMailResetUserPassword = async (targetMail: string, token: string) => {
        try {
            let html = fs.readFileSync("./utils/mailMessages/passwordReset.html", "utf8");
            let template = handlebars.compile(html);

            let variables = {
                endPoint: this.url + "/resetPassword/" + token,
            };

            let htmlToSend = template(variables);

            let mailOptions = {
                from: '"Bot morsujity" <bot@morsujity.pl>', // sender address
                to: targetMail, // list of receivers
                subject: "Zresetuj Hasło", // Subject line
                html: htmlToSend, // html body
            };

            this.transporter.sendMail(mailOptions);
        } catch (error: any) {
            setTimeout(() => {
                this.sendMailEmailUserVerification(targetMail, token);
            }, 10000);
        }
    };
}

export default MailBot;
