import { Metadata } from "next";
import Image from "next/image";
import SignInForm from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: "Phòng khám Yasoco | Đăng nhập",
  description:
    "Phòng khám Yasoco - Nơi chăm sóc sức khỏe toàn diện cho trẻ em.",
};

export default async function SignIn() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
