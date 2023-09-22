import { InferType, object, string } from "yup";

const changePseudonymSchema = object({
    body: object({
        pseudonym: string()
            .required("'pseudonym' wymagane")
            .min(3, "Ksywka za krótka - Co najmniej 3 znaki")
            .max(30, "Ksywka za długa - Maksymalnie 30 znaków")
    })
});
type ChangePseudonymData = InferType<typeof changePseudonymSchema>;

export { ChangePseudonymData, changePseudonymSchema };
