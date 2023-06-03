import { InferType, object, string } from "yup";

const resetPasswordSchema = object({
    body: object({
        email: string().required("'email' wymagane").email("email niepoprawny"),
    }),
});
export type ResetEmailData = InferType<typeof resetPasswordSchema>;
export default resetPasswordSchema;
