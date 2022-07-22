import * as yup from "yup";

const loginUserSchema = yup.object({
    body: yup.object({
        email: yup.string().required("'email' wymagane").email("Email niepoprawny"),
        password: yup
            .string()
            .required("'password' wymagane")
            .min(8, "Hasło niepoprawne")
            .max(20, "Hasło niepoprawne")
            .matches(/(?=.*[a-z])/, "Hasło niepoprawne")
            .matches(/(?=.*[A-Z])/, "Hasło niepoprawne")
            .matches(/(?=.*[0-9])/, "Hasło niepoprawne")
            .matches(/(?=.*[!@#$%^&*])/, "Hasło niepoprawne"),
    }),
});

export type loginUserData = yup.InferType<typeof loginUserSchema.fields.body>;

export default loginUserSchema;
