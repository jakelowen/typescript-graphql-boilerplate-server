import * as yup from "yup";
import { registerPasswordValidation } from "../../../../yupSchemas";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export default schema;
