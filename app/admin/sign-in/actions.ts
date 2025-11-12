"use server";

import { redirect } from "next/navigation";
import { signInSchema } from "./schema";

export type SignInState = {
  errors?: {
    phone?: string[];
    password?: string[];
    _form?: string[]; // Lỗi chung không thuộc field nào
  };
  message?: string | null;
};

// --- Giả lập logic xác thực ---
async function authenticateUser(
  phone: string,
  password: string
): Promise<{
  success: true;
  user: { id: string; phone: string };
}> {
  console.log(`SERVER: Đang xác thực SĐT: ${phone}`);
  await new Promise((res) => setTimeout(res, 1000));

  if (phone === "0987654321" && password === "123456") {
    console.log("SERVER: Đăng nhập thành công!");
    return { success: true, user: { id: "1", phone } };
  } else {
    console.log("SERVER: Đăng nhập thất bại.");
    throw new Error("Số điện thoại hoặc mật khẩu không chính xác.");
  }
}
// --- Hết phần giả lập ---

/**
 * Server Action để xử lý đăng nhập.
 * Nhận `previousState` và `formData`, trả về `SignInState`.
 */
export async function signInAction(
  previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  // 1. Lấy dữ liệu thô từ form
  const data = Object.fromEntries(formData.entries());

  // 2. Validate lại dữ liệu ở SERVER
  const validationResult = signInSchema.safeParse(data);

  if (!validationResult.success) {
    // Nếu Zod fail, trả về lỗi đã được flat
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: null,
    };
  }

  const { phone, password } = validationResult.data;

  // 3. Thử thực hiện logic đăng nhập
  try {
    await authenticateUser(phone, password);
  } catch (error) {
    // 4. Xử lý lỗi logic (VD: sai mật khẩu)
    if (error instanceof Error) {
      return {
        errors: {},
        message: error.message, // Hiển thị lỗi chung này
      };
    }
    // Lỗi không mong muốn
    return {
      errors: {},
      message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
    };
  }

  // 5. Đăng nhập THÀNH CÔNG
  const returnTo = formData.get("returnTo");
  redirect(returnTo?.toString() || "/admin/dashboard"); // Chuyển đến trang dashboard
}
