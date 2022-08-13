import * as yup from "yup";

const emailTokenSchema = yup.object({
    body: yup.object({
        token: yup.string().required("'token' wymagane").length(24, "'token' niepoprawny"),
    }),
});

export type EmailTokenData = yup.InferType<typeof emailTokenSchema.fields.body>;

export default emailTokenSchema;
