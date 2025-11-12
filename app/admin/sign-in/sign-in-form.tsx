"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Smartphone, Lock } from "lucide-react";
import { signInAction as serverSignInAction, SignInState } from "./actions";
import { signInSchema } from "./schema";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A6CF52] hover:bg-[#95b847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A6CF52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Đang đăng nhập...
        </div>
      ) : (
        "Đăng nhập"
      )}
    </button>
  );
}

export default function SignInForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const initialState: SignInState = {
    errors: {},
    message: null,
  };

  const clientAction = async (
    previousState: SignInState,
    formData: FormData
  ): Promise<SignInState> => {
    const data = Object.fromEntries(formData.entries());

    const validationResult = signInSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        errors: validationResult.error.flatten().fieldErrors,
        message: null,
      };
    }

    // 6. Nếu Zod client thành công:
    // Gọi `serverSignInAction`
    return await serverSignInAction(previousState, formData);
  };

  // 7. Hook `useActionState`
  // TypeScript sẽ tự động suy ra `state` là `SignInState`
  const [state, formAction] = useActionState(clientAction, initialState);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* ...Phần Logo và Tiêu đề không đổi... */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-5">
            <div className="flex justify-center">
              <Image
                src={"/full-logo.png"}
                alt="Full logo"
                width={200}
                height={200}
                className="flex items-center justify-center"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Phòng khám Yasoco
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>

          {/* 8. Gắn `formAction` vào prop `action` của form */}
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="returnTo" value={returnTo || ""} />

            {/* --- Trường Số Điện Thoại --- */}
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
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#A6CF52] focus:border-[#A6CF52] sm:text-sm ${
                    state.errors?.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              {/* Hiển thị lỗi Zod của field 'phone' */}
              {state.errors?.phone && (
                <p className="mt-2 text-sm text-red-600">
                  {state.errors.phone[0]}
                </p>
              )}
            </div>

            {/* --- Trường Mật Khẩu --- */}
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
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#A6CF52] focus:border-[#A6CF52] sm:text-sm ${
                    state.errors?.password || state.message
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {/* Hiển thị lỗi chung (server) hoặc lỗi Zod 'password' */}
              {(state.errors?.password || state.message) && (
                <p className="mt-2 text-sm text-red-600">
                  {state.message || state.errors?.password?.[0]}
                </p>
              )}
            </div>

            {/* --- Nút Submit --- */}
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
