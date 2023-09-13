import { InferType, object, string } from "yup";

const resetPasswordSchema = object({
    body: object({
        email: string().required("'email' wymagane").email("email niepoprawny"),
    }),
});
type ResetPasswordData = InferType<typeof resetPasswordSchema>;

export { ResetPasswordData, resetPasswordSchema };
