import { InferType, object, string } from "yup";

const emailTokenSchema = object({
    body: object({
        token: string().required("'token' wymagane").length(24, "'token' niepoprawny"),
    }),
});
export type EmailTokenData = InferType<typeof emailTokenSchema>;
export default emailTokenSchema;
