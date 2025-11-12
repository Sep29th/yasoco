import { z } from "zod";

export const signInSchema = z
  .object({
    phone: z
      .string()
      .min(1, "Số điện thoại là bắt buộc")
      .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  })
  .strict();

export type SignInSchema = z.infer<typeof signInSchema>;
