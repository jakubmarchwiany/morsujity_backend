import { InferType, object, string } from "yup";

const emailSchema = object({
    body: object({
        email: string().required("'email' wymagane").email("email niepoprawny"),
    }),
});
type EmailData = InferType<typeof emailSchema>;

export { EmailData, emailSchema };
