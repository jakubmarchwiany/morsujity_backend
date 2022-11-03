import * as yup from "yup";

const changePseudonymSchema = yup.object({
    body: yup.object({
        pseudonym: yup
            .string()
            .required("'pseudonym' wymagane")
            .min(3, "Ksywka za krótka - Co najmniej 3 znaki")
            .max(30, "Ksywka za długa - Maksymalnie 30 znaków"),
    }),
});
export type ChangePseudonymData = yup.InferType<typeof changePseudonymSchema.fields.body>;
export default changePseudonymSchema;
