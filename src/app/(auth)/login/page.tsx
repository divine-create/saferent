"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setAuthError(null);
    try {
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(result.error);
      } else {
        // Refresh session then let middleware redirect to role-based dashboard
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch {
      setAuthError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500">Sign in to your SafeRent account to continue.</p>
      </div>

      {authError && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 text-sm text-red-700 flex items-center gap-2">
          <span className="font-semibold">Error:</span> {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email or Phone Number"
          placeholder="e.g. adaobi@email.com or 08012345678"
          error={errors.identifier?.message}
          {...register("identifier")}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            error={errors.password?.message}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register("password")}
          />
          <div className="flex justify-end mt-1.5">
            <Link href="/forgot-password" className="text-xs font-semibold text-[#0F7B5A] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full !h-12 text-base font-bold rounded-xl" size="lg" isLoading={isSubmitting}>
          Sign in to SafeRent
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Button
        variant="outline"
        className="w-full !h-12 rounded-xl border-2 font-semibold"
        size="lg"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        leftIcon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        }
      >
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#0F7B5A] font-bold hover:underline">
          Create one — it&apos;s free
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-gray-400">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{" "}
        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
      </p>
    </div>
  );
}
