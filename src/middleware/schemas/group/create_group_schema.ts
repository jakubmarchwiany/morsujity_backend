import { InferType, array, number, object, string } from "yup";

const createGroupSchema = object({
    body: object({
        name: string()
            .required("'name' wymagane")
            .min(3, "Nazwa za krótka - Co najmniej 3 znaki")
            .max(15, "Nazwa za długa - Maksymalnie 50 znaków"),
        description: string()
            .required("'description' wymagane")
            .min(20, "Opis za krótka - Co najmniej 20 znaków")
            .max(280, "Opis za długa - Maksymalnie 280 znaków"),
        coordinates: array().required("'coordinates' wymagane")
            .of(number())
            .length(2, "Współrzędne muszą zawierać długość i szerokość geograficzną"),
    }),
});
export type CreateGroupData = InferType<typeof createGroupSchema>;
export default createGroupSchema;
