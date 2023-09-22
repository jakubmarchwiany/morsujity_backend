import { InferType, object, string } from "yup";

const resetPasswordEmailSchema = object({
    body: object({
        email: string().required("'email' wymagane").email("email niepoprawny")
    })
});
type ResetPasswordEmailData = InferType<typeof resetPasswordEmailSchema>;

export { ResetPasswordEmailData, resetPasswordEmailSchema };
