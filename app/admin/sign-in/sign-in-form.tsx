"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Smartphone, Lock } from "lucide-react";
import { signInAction as serverSignInAction } from "./actions";
import { signInSchema } from "./schema";
import { SubmitButton } from "./submit-button";
import { SignInState } from "./_types/form-messages";
import z from "zod";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const initialState: SignInState = {};

  const clientAction = async (
    _: SignInState,
    formData: FormData
  ): Promise<SignInState> => {
    const data = Object.fromEntries(formData.entries());

    const validationResult = signInSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        ...(z.treeifyError(validationResult.error).properties ?? {}),
        values: {
          phone: formData.get("phone") as string,
          password: formData.get("password") as string,
        },
      };
    }

    return serverSignInAction(validationResult.data, returnTo, formData);
  };

  const [state, formAction, isPending] = useActionState(
    clientAction,
    initialState
  );

  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Số điện thoại
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Smartphone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={state.values?.phone || ""}
            key={state.values?.phone}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#A6CF52] focus:border-[#A6CF52] sm:text-sm ${
              state.phone ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Nhập số điện thoại"
          />
        </div>
        {state.phone && (
          <>
            {state.phone.errors.map((error, indx) => (
              <p key={`phone-${indx}`} className="mt-2 text-sm text-red-600">
                {error}
              </p>
            ))}
          </>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mật khẩu
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            defaultValue={state.values?.password || ""}
            key={state.values?.password}
            className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#A6CF52] focus:border-[#A6CF52] sm:text-sm ${
              state.password ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Nhập mật khẩu"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {state.password && (
          <>
            {state.password.errors.map((error, indx) => (
              <p key={`password-${indx}`} className="mt-2 text-sm text-red-600">
                {error}
              </p>
            ))}
          </>
        )}
      </div>
      <SubmitButton loading={isPending} />
    </form>
  );
}
