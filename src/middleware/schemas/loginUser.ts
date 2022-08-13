import * as yup from "yup";

const loginUserSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required("'email' wymagane")
            .email("Podano nieprawidłowe dane uwierzytelniające"),
        password: yup
            .string()
            .required("'password' wymagane")
            .min(8, "Podano nieprawidłowe dane uwierzytelniające")
            .max(20, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[a-z])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[A-Z])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[0-9])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[!@#$%^&*])/, "Podano nieprawidłowe dane uwierzytelniające"),
    }),
});

export type LoginUserData = yup.InferType<typeof loginUserSchema.fields.body>;

export default loginUserSchema;
