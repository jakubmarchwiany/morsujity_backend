import { InferType, object, string } from "yup";

const updatePasswordWithTokenSchema = object({
    body: object({
        newPassword: string()
            .required("'newPassword' wymagane")
            .min(8, "Hasło za krótkie - co najmniej 8 znaków")
            .max(20, "Hasło za długie - maksymalnie 20 znaków")
            .matches(/(?=.*[a-z])/, "Musi zawierać mała literę")
            .matches(/(?=.*[A-Z])/, "Musi zawierać dużą literę")
            .matches(/(?=.*[0-9])/, "Musi zawierać cyfrę")
            .matches(/(?=.*[!@#$%^&*])/, "Musi zawierać znak specjalny (! @ # $ % ^ & *)"),
        token: string().required("'token' wymagane").length(36, "Token niepoprawny"),
    }),
});
type UpdatePasswordWithTokenData = InferType<typeof updatePasswordWithTokenSchema>;

export { UpdatePasswordWithTokenData, updatePasswordWithTokenSchema };
