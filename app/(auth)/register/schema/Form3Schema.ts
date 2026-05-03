import * as yup from "yup";

export const schema = yup.object({
    
    username: yup.string()
    .required("Please enter a username")
    .min(3, "Username must be at least 3 characters")
    .matches(/[A-Z]/,"Username must contain at least one uppercase letter")
    .matches(/[a-z]/,"Username must contain at least one lowercase letter")
    .matches(/[0-9]/,"Username must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,"Username must contain at least one special character"),

    bio: yup.string()
    .required("Please tell us a bit about yourself")
    .min(3, "Bio must be at least 3 characters long")
    .max(200, "Bio is too long"),

    interests: yup.array()
    .of(yup.string().min(3, "Interest must be at least 3 characters long"))
    .min(1, "Please select at least one interest"),
})
