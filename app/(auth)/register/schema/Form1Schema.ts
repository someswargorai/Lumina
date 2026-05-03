import * as yup from "yup";

export const schema = yup.object({
    name: yup.string().required("Please enter your name"),
    email: yup.string().required("Please enter your email").email("Please enter a valid email"),
    password: yup.string().required("Please enter your password").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/i, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    
    confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords do not match").required("Please confirm your password"),
})  