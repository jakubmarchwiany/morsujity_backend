import { boolean, date, InferType, number, object } from "yup";

const newActivitySchema = object({
    body: object({
        activityType: boolean().required("'activityType' wymagane"),
        date: date().required("'data' wymagane"),
        duration: number()
            .required("'duration' wymagane")
            .min(1, "Minimalna długość aktywności to 1 s")
            .max(3660, "Maksymalna długość aktywności to 1h"),
    }),
});
type NewActivityData = InferType<typeof newActivitySchema>;

export { NewActivityData, newActivitySchema };
