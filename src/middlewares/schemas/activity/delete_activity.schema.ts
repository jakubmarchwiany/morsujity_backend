import { InferType, object, string } from "yup";

const deleteActivitySchema = object({
    body: object({
        _id: string().required("'activityID' wymagane").length(24, "'activityID' niepoprawny")
    })
});
type DeleteActivityData = InferType<typeof deleteActivitySchema>;

export { DeleteActivityData, deleteActivitySchema };
