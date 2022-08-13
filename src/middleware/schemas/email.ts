import * as yup from "yup";

const emailSchema = yup.object({
    body: yup.object({
        email: yup.string().required("'email' wymagane").email("email niepoprawny"),
    }),
});

export type EmailData = yup.InferType<typeof emailSchema.fields.body>;

export default emailSchema;
