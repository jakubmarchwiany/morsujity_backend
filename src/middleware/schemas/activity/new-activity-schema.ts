import { boolean, date, InferType, number, object } from "yup";

const newActivitySchema = object({
    body: object({
        isMors: boolean().required("'isMors' wymagane"),
        date: date().required("'data' wymagane"),
        duration: number()
            .required("'duration' wymagane")
            .max(3660, "Maksymalna długość aktywności to 1h"),
    }),
});
export type NewActivityData = InferType<typeof newActivitySchema>;
export default newActivitySchema;
