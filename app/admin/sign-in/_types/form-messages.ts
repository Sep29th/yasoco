import { FieldToFormState } from "@/lib/utils";
import { SignInSchema } from "../schema";

export type SignInState = FieldToFormState<keyof SignInSchema>;
