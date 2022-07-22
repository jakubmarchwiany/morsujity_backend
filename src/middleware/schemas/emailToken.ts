import * as yup from "yup";

const emailTokenSchema = yup.object({
    params: yup.object({
        token: yup.string().required("Token niepoprawny").length(24, "Token niepoprawny"),
    }),
});

export default emailTokenSchema;
