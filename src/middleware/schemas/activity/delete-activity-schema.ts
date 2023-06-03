import { InferType, object, string } from "yup";

const deleteActivitySchema = object({
    body: object({
        activityID: string()
            .required("'activityID' wymagane")
            .length(24, "'activityID' niepoprawny"),
    }),
});
export type DeleteActivityData = InferType<typeof deleteActivitySchema>;
export default deleteActivitySchema;
