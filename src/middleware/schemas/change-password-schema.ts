import * as yup from "yup";

const changePasswordSchema = yup.object({
    body: yup.object({
        oldPassword: yup
            .string()
            .required("'oldPassword' wymagane")
            .min(8, "Hasło za krótkie - co najmniej 8 znaków")
            .max(20, "Hasło za długie - maksymalnie 20 znaków")
            .matches(/(?=.*[a-z])/, "Musi zawierać mała literę")
            .matches(/(?=.*[A-Z])/, "Musi zawierać dużą literę")
            .matches(/(?=.*[0-9])/, "Musi zawierać cyfrę")
            .matches(/(?=.*[!@#$%^&*])/, "Musi zawierać znak specjalny (! @ # $ % ^ & *)"),
        newPassword: yup
            .string()
            .required("'newPassword' wymagane")
            .min(8, "Hasło za krótkie - co najmniej 8 znaków")
            .max(20, "Hasło za długie - maksymalnie 20 znaków")
            .matches(/(?=.*[a-z])/, "Musi zawierać mała literę")
            .matches(/(?=.*[A-Z])/, "Musi zawierać dużą literę")
            .matches(/(?=.*[0-9])/, "Musi zawierać cyfrę")
            .matches(/(?=.*[!@#$%^&*])/, "Musi zawierać znak specjalny (! @ # $ % ^ & *)"),
    }),
});
export type ChangePasswordData = yup.InferType<typeof changePasswordSchema.fields.body>;
export default changePasswordSchema;
