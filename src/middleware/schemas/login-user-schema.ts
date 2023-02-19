import { InferType, object, string } from "yup";

const loginUserSchema = object({
    body: object({
        email: string()
            .required("'email' wymagane")
            .email("Podano nieprawidłowe dane uwierzytelniające"),
        password: string()
            .required("'password' wymagane")
            .min(8, "Podano nieprawidłowe dane uwierzytelniające")
            .max(20, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[a-z])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[A-Z])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[0-9])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[!@#$%^&*])/, "Podano nieprawidłowe dane uwierzytelniające"),
    }),
});
export type LoginUserData = InferType<typeof loginUserSchema>;
export default loginUserSchema;
