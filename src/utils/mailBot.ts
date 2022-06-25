"use strict";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import * as bcrypt from "bcryptjs";

import tmpHashModel from "../models/tmpHash/tmpHash.model";
import TmpHash from "models/tmpHash/tmpHash.interface";
import verificationMessage from "./verificationMessage";

const { SERVER_HOST, SERVER_MAIL_PORT, SERVER_MAIL_USER, SERVER_MAIL_PASS } = process.env;

class MailBot {
    private transporter: Transporter;
    private tmpHash = tmpHashModel;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: SERVER_HOST,
            port: parseInt(SERVER_MAIL_PORT!),
            secure: true,
            auth: {
                user: SERVER_MAIL_USER,
                pass: SERVER_MAIL_PASS,
            },
            // tls: {
            //     rejectUnauthorized: false,
            // },
        });
        console.log("Mail bot working");
    }

    private async createTmpHash(targetMail: string, accountId: string) {
        let verificationHash = await bcrypt.hash(targetMail, 10);
        verificationHash = verificationHash.replace("/", "k");
        await this.tmpHash.create({
            hash: verificationHash,
            accountRef: accountId,
        });
        return verificationHash;
    }

    public sendVerificationMail = async (targetMail: string, accountId: string) => {
        try {
            let hash = await this.createTmpHash(targetMail, accountId);
            
            let message = verificationMessage(hash);

            let mailOptions = {
                from: '"Bot morsujity" <bot@morsujity.pl>', // sender address
                to: targetMail, // list of receivers
                subject: "Zweryfikuj konto", // Subject line
                html: message, // html body
            };

            this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.log(error);
        }
    };
}

export default MailBot;
