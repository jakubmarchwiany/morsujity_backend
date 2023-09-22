import { date, InferType, number, object } from "yup";

const createActivitySchema = object({
    body: object({
        type: number().min(0).required("'activityType' wymagane"),
        date: date().required("'data' wymagane"),
        duration: number()
            .required("'duration' wymagane")
            .min(1, "Minimalna długość aktywności to 1 s")
            .max(3659, "Maksymalna długość aktywności to 1h")
    })
});
type CreateActivityData = InferType<typeof createActivitySchema>;

export { CreateActivityData, createActivitySchema };
