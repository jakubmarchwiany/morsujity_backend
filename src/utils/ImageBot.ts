import { Storage } from "@google-cloud/storage";
import Multer from "multer";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import HttpException from "../middleware/exceptions/HttpException";

const { PROJECT_ID, GCLOUD_STORAGE_IMAGE_BUCKET } = process.env;

let projectId = PROJECT_ID; // Get this from Google Cloud
let keyFilename = "myKey.json"; // Get this from Google Cloud -> Credentials -> Service Accounts

const roundedCorners = Buffer.from(
    '<svg><rect x="0" y="0" width="500" height="500" rx="50" ry="50"/></svg>'
);

class ImageBot {
    private storage;
    private imageBucket;
    public multer;

    constructor() {
        this.storage = new Storage({
            projectId,
            keyFilename,
        });
        this.multer = Multer({
            storage: Multer.memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
            },
            fileFilter: (_req, file, cb) => {
                this.checkFileType(file, cb);
            },
        });
        this.imageBucket = this.storage.bucket(GCLOUD_STORAGE_IMAGE_BUCKET);
    }

    private checkFileType(file: any, cb: any) {
        // Allowed ext
        const filetypes = /webp|jpeg|jpg|png/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new HttpException(400, `Dozwolone rozszerzenia: ${filetypes}!`), false);
        }
    }

    public saveNewUserImage = (file: any) => {
        return new Promise<string>(async (resolve, reject) => {
            try {
                let convertedImage = await sharp(file.buffer)
                    .resize(500, 500, { fit: "fill" })
                    .composite([
                        {
                            input: roundedCorners,
                            blend: "dest-in",
                        },
                    ])
                    .webp({ quality: 90 })
                    .toBuffer();

                let uniqueName = uuidv4();
                const imageFile = this.imageBucket.file(uniqueName + ".webp");
                await imageFile.save(convertedImage);

                resolve(uniqueName);
            } catch (error: any) {
                error.message = "Błąd podczas zapisu zdjęcia użytkownika";
                reject(error);
            }
        });
    };

    public deleteUserImage = (fileName: string) => {
        return new Promise<null>(async (resolve, reject) => {
            try {
                const file = this.imageBucket.file(fileName);
                await file.delete();
                resolve(null);
            } catch (error: any) {
                error.message = "Błąd podczas usuwania zdjęcia użytkownika";
                reject(error);
            }
        });
    };
}

export default ImageBot;
