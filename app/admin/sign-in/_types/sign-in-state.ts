import { FieldToFormState } from "@/lib/utils";
import { SignInSchema } from "../_schemas/sign-in";

export type SignInState = FieldToFormState<keyof SignInSchema>;
