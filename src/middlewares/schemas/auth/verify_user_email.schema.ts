import { InferType, object, string } from "yup";

const verifyUserEmailSchema = object({
    body: object({
        token: string().required("'token' wymagane").length(24, "'token' niepoprawny"),
    }),
});
type EmailTokenData = InferType<typeof verifyUserEmailSchema>;

export { EmailTokenData, verifyUserEmailSchema };
