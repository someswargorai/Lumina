import * as yup from "yup";

export const schema = yup.object({
    otp: yup.string().required("Please enter the verification code").length(6, "Code must be 6 digits").matches(/^\d+$/, "Code must contain only numbers"),
})
