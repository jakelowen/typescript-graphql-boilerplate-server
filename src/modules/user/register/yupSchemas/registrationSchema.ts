import * as yup from "yup";
import { emailNotLongEnough, invalidEmail } from "../errorMessages";
import { registerPasswordValidation } from "../../../../yupSchemas";

export default yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: registerPasswordValidation,
  firstName: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255),
  lastName: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
});
