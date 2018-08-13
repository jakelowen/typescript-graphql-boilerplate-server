import * as yup from "yup";
import { emailNotLongEnough, invalidEmail } from "../errorMessages";

export default yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail)
});
