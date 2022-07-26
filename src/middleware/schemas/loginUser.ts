import * as yup from "yup";

const loginUserSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required("Podano nieprawidłowe dane uwierzytelniające")
            .email("Podano nieprawidłowe dane uwierzytelniające"),
        password: yup
            .string()
            .required("Podano nieprawidłowe dane uwierzytelniające")
            .min(8, "Podano nieprawidłowe dane uwierzytelniające")
            .max(20, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[a-z])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[A-Z])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[0-9])/, "Podano nieprawidłowe dane uwierzytelniające")
            .matches(/(?=.*[!@#$%^&*])/, "Podano nieprawidłowe dane uwierzytelniające"),
    }),
});

export type loginUserData = yup.InferType<typeof loginUserSchema.fields.body>;

export default loginUserSchema;
