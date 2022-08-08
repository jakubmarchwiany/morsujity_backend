import * as multer from "multer";
import * as sharp from "sharp";
import * as path from "path";
import * as fs from "fs";

let { DEF_USER_IMAGE_PATH } = process.env;

class ImageBot {
    private storage;
    public upload;

    constructor() {
        this.storage = multer.memoryStorage();
        this.upload = multer({
            storage: this.storage,
            fileFilter: (_req, file, cb) => {
                this.checkFileType(file, cb);
            },
        });
    }

    private checkFileType(file: any, cb: any) {
        // Allowed ext
        const filetypes = /jpeg|jpg|png/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb({ message: `Dozwolone rozszerzenia: ${filetypes}!` });
        }
    }

    public saveNewUserImage = async (file: any) => {
        try {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const path = `./public/${DEF_USER_IMAGE_PATH}/${uniqueSuffix}.webp`;

            const roundedCorners = Buffer.from(
                '<svg><rect x="0" y="0" width="500" height="500" rx="50" ry="50"/></svg>'
            );

            await sharp(file.buffer)
                .resize(500, 500, { fit: "fill" })
                .composite([
                    {
                        input: roundedCorners,
                        blend: "dest-in",
                    },
                ])
                .webp({ quality: 90 })
                .toFile(path);
            return uniqueSuffix + ".webp";
        } catch (error) {
            console.log(error);
        }
    };

    public deleteUserImage = async (fileName: string) => {
        try {
            let path = `./public/${DEF_USER_IMAGE_PATH}/${fileName}`;
            fs.unlinkSync(path);
        } catch (err) {
            console.error(err);
        }
    };
}

export default ImageBot;
