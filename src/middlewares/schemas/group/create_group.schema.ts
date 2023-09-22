import { InferType, array, number, object, string } from "yup";

const createGroupSchema = object({
    body: object({
        type: number().required("'type' wymagane").min(0).max(2),
        name: string()
            .required("'name' wymagane")
            .min(3, "Nazwa za krótka - Co najmniej 3 znaki")
            .max(50, "Nazwa za długa - Maksymalnie 50 znaków"),
        description: string()
            .required("'description' wymagane")
            .min(10, "Opis za krótka - Co najmniej 10 znaków")
            .max(280, "Opis za długa - Maksymalnie 280 znaków"),
        coordinates: array()
            .required("'coordinates' wymagane")
            .of(number())
            .length(2, "Współrzędne muszą zawierać długość i szerokość geograficzną")
    })
});
type CreateGroupData = InferType<typeof createGroupSchema>;

export { CreateGroupData, createGroupSchema };
