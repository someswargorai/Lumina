import * as yup from "yup";

export const schema = yup.object({
    state: yup.string().min(3, "State name must be at least 3 characters").required("Please select your state"),
    city: yup.string().min(3, "City name must be at least 3 characters").required("Please select your city"),
})
