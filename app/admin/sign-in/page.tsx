import { Metadata } from "next";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = {
  title: "Phòng khám Yasoco | Đăng nhập",
  description:
    "Phòng khám Yasoco - Nơi chăm sóc sức khỏe toàn diện cho trẻ em.",
};

export default function SignIn() {
  return <SignInForm />;
}
