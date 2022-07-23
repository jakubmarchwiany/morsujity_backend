import * as yup from "yup";

const newPasswordSchema = yup.object({
    body: yup.object({
        newPassword: yup
            .string()
            .required("'password' wymagane")
            .min(8, "Hasło za krótkie - co najmniej 8 znaków")
            .max(20, "Hasło za długie - maksymalnie 20 znaków")
            .matches(/(?=.*[a-z])/, "Musi zawierać mała literę")
            .matches(/(?=.*[A-Z])/, "Musi zawierać dużą literę")
            .matches(/(?=.*[0-9])/, "Musi zawierać cyfrę")
            .matches(/(?=.*[!@#$%^&*])/, "Musi zawierać znak specjalny (! @ # $ % ^ & *)"),
        token: yup.string().required("Token niepoprawny").length(128, "Token niepoprawny"),
    }),
});

export type newPasswordData = yup.InferType<typeof newPasswordSchema.fields.body>;

export default newPasswordSchema;
