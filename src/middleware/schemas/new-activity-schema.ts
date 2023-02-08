import * as yup from "yup";

const newActivitySchema = yup.object({
    body: yup.object({
        isMors: yup.boolean().required("'isMors' wymagane"),
        date: yup.date().required("'data' wymagane"),
        duration: yup
            .number()
            .required("'duration' wymagane")
            .max(3660, "Maksymalna długość aktywności to 1h"),
    }),
});
export type NewActivityData = { isMors: boolean; date: Date; duration: number };
export default newActivitySchema;
