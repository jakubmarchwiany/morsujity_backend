import { Storage } from "@google-cloud/storage";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import HttpException from "../middleware/exceptions/http-exception";

const { PROJECT_ID, GCLOUD_STORAGE_IMAGE_BUCKET, KEY_FILE_NAME } = process.env;

const ROUNDED_CORNERS = Buffer.from(
    '<svg><rect x="0" y="0" width="500" height="500" rx="50" ry="50"/></svg>',
);

class ImageBot {
    private readonly storage;
    private readonly imageBucket;
    public multer;

    constructor() {
        this.storage = new Storage({
            projectId: PROJECT_ID,
            keyFilename: KEY_FILE_NAME,
        });
        this.multer = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // no larger than 10mb, you can change as needed.
            },
            fileFilter: (_req, file, cb) => {
                this.checkFileType(file, cb);
            },
        });
        this.imageBucket = this.storage.bucket(GCLOUD_STORAGE_IMAGE_BUCKET);
    }

    private checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
        // Allowed ext
        const filetypes = new RegExp(/webp|jpeg|jpg|png/);
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            cb(null, true);
        } else {
            cb(new HttpException(400, `Dozwolone rozszerzenia: webp jpeg jpg png`));
        }
    }

    public saveNewUserImage = async (file: Express.Multer.File) => {
        try {
            const convertedImage = await sharp(file.buffer)
                .resize(500, 500, { fit: "fill" })
                .composite([
                    {
                        input: ROUNDED_CORNERS,
                        blend: "dest-in",
                    },
                ])
                .webp({ quality: 90 })
                .toBuffer();

            const uniqueName = uuidv4();
            const imageFile = this.imageBucket.file(uniqueName + ".webp");
            await imageFile.save(convertedImage);

            return uniqueName;
        } catch (e) {
            throw new HttpException(500, "Błąd podczas zapisu zdjęcia użytkownika");
        }
    };

    public deleteUserImage = async (fileName: string) => {
        try {
            const file = this.imageBucket.file(fileName);
            await file.delete();
            return true;
        } catch (e) {
            throw new HttpException(500, "Błąd podczas usuwania zdjęcia użytkownika");
        }
    };
}
export default ImageBot;
