"use server";

import { redirect } from "next/navigation";
import { SignInSchema } from "../_schemas/sign-in";
import { signIn } from "@/lib/auth";

export async function signInAction(
  data: SignInSchema,
  returnTo: string | null
) {
  const result = await signIn(data.phone, data.password);

  if (result !== true) return result;

  redirect(returnTo ?? "/admin");
}
