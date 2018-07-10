import * as yup from "yup";
import { passwordNotLongEnough } from "./modules/user/shared/errorMessages";
import {
  emailNotLongEnough,
  invalidEmail
} from "./modules/user/register/errorMessages";

export const registerPasswordValidation = yup
  .string()
  .min(3, passwordNotLongEnough)
  .max(255);

export const registrationYupSchema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: registerPasswordValidation
});
