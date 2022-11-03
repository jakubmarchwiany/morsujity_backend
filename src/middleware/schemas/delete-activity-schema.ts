import * as yup from "yup";

const deleteActivitySchema = yup.object({
    body: yup.object({
        activityID: yup
            .string()
            .required("'activityID' wymagane")
            .length(24, "'activityID' niepoprawny"),
    }),
});
export type DeleteActivityData = yup.InferType<typeof deleteActivitySchema.fields.body>;
export default deleteActivitySchema;
