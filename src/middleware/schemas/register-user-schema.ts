import * as yup from "yup";

const registerUserSchema = yup.object({
    body: yup.object({
        pseudonym: yup
            .string()
            .required("'pseudonym' wymagane")
            .min(3, "Ksywka za krótka - Co najmniej 3 znaki")
            .max(15, "Ksywka za długa - Maksymalnie 15 znaków"),
        email: yup.string().required("'email' wymagane").email("Email niepoprawny"),
        password: yup
            .string()
            .required("'password' wymagane")
            .min(8, "Hasło za krótkie - co najmniej 8 znaków")
            .max(20, "Hasło za długie - maksymalnie 20 znaków")
            .matches(/(?=.*[a-z])/, "Musi zawierać mała literę")
            .matches(/(?=.*[A-Z])/, "Musi zawierać dużą literę")
            .matches(/(?=.*[0-9])/, "Musi zawierać cyfrę")
            .matches(/(?=.*[!@#$%^&*])/, "Musi zawierać znak specjalny (! @ # $ % ^ & *)"),
    }),
});
export type RegisterUserData = yup.InferType<typeof registerUserSchema.fields.body>;
export default registerUserSchema;
