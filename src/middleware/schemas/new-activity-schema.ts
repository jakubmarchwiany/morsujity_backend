import * as yup from "yup";

const newActivitySchema = yup.object({
    body: yup.object({
        isMors: yup.boolean().required("'isMors' wymagane"),
        date: yup
            .date()
            .required("'data' wymagane")
            .max(new Date(), "Nie możesz wpisać daty z przyszłości"),
        duration: yup
            .number()
            .required("'duration' wymagane")
            .max(3660, "Maksymalna długość aktywności to 1h"),
    }),
});
export type NewActivityData = yup.InferType<typeof newActivitySchema.fields.body>;
export default newActivitySchema;
