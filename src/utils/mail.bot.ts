import fs from "fs";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import path from "path";
import { ENV } from "./env_validation";

const { FRONT_URL_ADDRESS, MAIL_HOST, MAIL_PORT, MAIL_PASS, MAIL_USER, MAIL_FROM } = ENV;

export class MailBot {
    private transporter!: Transporter;

    constructor() {
        this.createTransport();
    }

    private createTransport() {
        try {
            this.transporter = nodemailer.createTransport(
                smtpTransport({
                    host: MAIL_HOST,
                    port: MAIL_PORT,
                    auth: {
                        user: MAIL_USER,
                        pass: MAIL_PASS,
                    },
                })
            );
        } catch (e) {
            setTimeout(() => {
                this.createTransport();
            }, 10000);
        }
    }
    public sendMailVerificationEmail = async (targetMail: string, token: string) => {
        const html = fs.readFileSync(
            path.resolve(__dirname, "email_messages/verification_email.html"),
            "utf8"
        );
        const template = handlebars.compile(html);
        const variables = {
            endPoint: FRONT_URL_ADDRESS + "/auth/verify-email?token=" + token,
        };
        const htmlToSend = template(variables);

        const mailOptions = {
            from: MAIL_FROM, // sender address
            to: targetMail, // list of receivers
            subject: "Zweryfikuj konto", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };

    public sendMailResetPassword = async (targetMail: string, token: string) => {
        const html = fs.readFileSync(
            path.resolve(__dirname, "email_messages/reset_password.html"),
            "utf8"
        );
        const template = handlebars.compile(html);
        const variables = {
            endPoint: FRONT_URL_ADDRESS + "/auth/new-password?token=" + token,
        };
        const htmlToSend = template(variables);

        const mailOptions = {
            from: MAIL_FROM, // sender address
            to: targetMail, // list of receivers
            subject: "Zresetuj Hasło", // Subject line
            html: htmlToSend, // html body
        };

        return this.transporter.sendMail(mailOptions);
    };
}
