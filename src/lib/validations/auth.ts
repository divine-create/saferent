import { z } from "zod";

export const registerSchema = z
  .object({
    role: z.enum(["TENANT", "LANDLORD", "AGENT"]),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^(\+?234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required",
    path: ["email"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const bvnSchema = z.object({
  bvn: z
    .string()
    .length(11, "BVN must be exactly 11 digits")
    .regex(/^\d+$/, "BVN must contain only digits"),
});

export type BvnInput = z.infer<typeof bvnSchema>;

export const phoneOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+?234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number"),
});

export type PhoneOtpInput = z.infer<typeof phoneOtpSchema>;

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  code: z.string().length(6, "OTP must be 6 digits"),
  type: z.enum(["PHONE_VERIFY", "EMAIL_VERIFY", "LOGIN", "SENSITIVE_ACTION"]),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
