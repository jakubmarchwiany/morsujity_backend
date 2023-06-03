import { InferType, object, string } from "yup";

const registerUserSchema = object({
    body: object({
        pseudonym: string()
            .required("'pseudonym' wymagane")
            .min(3, "Ksywka za krótka - Co najmniej 3 znaki")
            .max(30, "Ksywka za długa - Maksymalnie 30 znaków"),
        email: string().required("'email' wymagane").email("Email niepoprawny"),
        password: string()
            .required("'password' wymagane")
            .min(8, "Hasło za krótkie - co najmniej 8 znaków")
            .max(20, "Hasło za długie - maksymalnie 20 znaków")
            .matches(/(?=.*[a-z])/, "Musi zawierać mała literę")
            .matches(/(?=.*[A-Z])/, "Musi zawierać dużą literę")
            .matches(/(?=.*[0-9])/, "Musi zawierać cyfrę")
            .matches(/(?=.*[!@#$%^&*])/, "Musi zawierać znak specjalny (! @ # $ % ^ & *)"),
    }),
});
export type RegisterUserData = InferType<typeof registerUserSchema>;
export default registerUserSchema;
