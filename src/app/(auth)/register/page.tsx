"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { RoleCard } from "@/components/ui/RoleCard";
import { OtpInput } from "@/components/ui/OtpInput";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Home, Building2, Briefcase, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";

const STEPS = [
  { label: "Role", description: "Choose account type" },
  { label: "Details", description: "Personal information" },
  { label: "Verify", description: "Phone verification" },
];

const roles = [
  {
    value: "TENANT" as const,
    title: "I'm a Tenant",
    description: "Looking for a home to rent in Nigeria",
    icon: <Home className="w-6 h-6" />,
    features: [
      "Browse verified listings",
      "Secure escrow payments",
      "Legal agreement templates",
      "Tenant protection support",
    ],
  },
  {
    value: "LANDLORD" as const,
    title: "I'm a Landlord",
    description: "I have property I want to rent out",
    icon: <Building2 className="w-6 h-6" />,
    features: [
      "List your properties",
      "Screen tenants with BVN",
      "Receive secure payments",
      "SafeRent verified badge",
    ],
  },
  {
    value: "AGENT" as const,
    title: "I'm an Agent",
    description: "I manage rentals on behalf of clients",
    icon: <Briefcase className="w-6 h-6" />,
    features: [
      "Full CRM platform",
      "Multiple property listings",
      "Lead management tools",
      "LASRERA compliance support",
    ],
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<"TENANT" | "LANDLORD" | "AGENT" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredData, setRegisteredData] = useState<{ identifier: string; phone?: string } | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "TENANT" },
  });

  const handleRoleSelect = (role: "TENANT" | "LANDLORD" | "AGENT") => {
    setSelectedRole(role);
  };

  const goToStep2 = () => {
    if (!selectedRole) return;
    setCurrentStep(1);
  };

  const handleStep2Submit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const payload = { ...data, role: selectedRole! };
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error ?? "Registration failed. Please try again.");
        return;
      }

      // Determine identifier for OTP
      const identifier = data.phone || data.email || "";
      setRegisteredData({ identifier, phone: data.phone });

      // Send OTP if phone provided
      if (data.phone) {
        await sendOtp(data.phone);
      }

      setCurrentStep(2);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const sendOtp = async (identifier: string) => {
    setIsSendingOtp(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, type: "PHONE_VERIFY" }),
      });
      const result = await response.json();
      if (result.code) {
        setSentOtp(result.code);
        console.log(`[DEV] OTP Code: ${result.code}`);
      }
    } catch {
      console.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError(null);
    setIsVerifying(true);

    try {
      const identifier = registeredData?.phone || registeredData?.identifier || "";
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code: otpCode, type: "PHONE_VERIFY" }),
      });

      const result = await response.json();

      if (!response.ok) {
        setOtpError(result.error ?? "Verification failed");
        return;
      }

      // Sign in the user
      const values = getValues();
      const signInResult = await signIn("credentials", {
        identifier: values.phone || values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
      } else {
        router.push("/onboarding");
      }
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkipVerification = async () => {
    const values = getValues();
    const signInResult = await signIn("credentials", {
      identifier: values.phone || values.email,
      password: values.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Step indicator */}
      <div className="mb-7">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step 1: Role selection */}
      {currentStep === 0 && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">How will you use SafeRent?</p>
          </div>
          <div className="grid gap-3">
            {roles.map((role) => (
              <RoleCard
                key={role.value}
                value={role.value}
                title={role.title}
                description={role.description}
                icon={role.icon}
                features={role.features}
                isSelected={selectedRole === role.value}
                onClick={() => handleRoleSelect(role.value)}
              />
            ))}
          </div>
          <Button
            className="w-full mt-5"
            size="lg"
            onClick={goToStep2}
            disabled={!selectedRole}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue
          </Button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0F7B5A] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Personal details */}
      {currentStep === 1 && (
        <div>
          <button
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your details</h1>
            <p className="text-sm text-gray-500 mt-1">
              Signing up as a{" "}
              <span className="font-medium text-[#0F7B5A] capitalize">
                {selectedRole?.toLowerCase()}
              </span>
            </p>
          </div>

          {serverError && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(handleStep2Submit)}
            className="space-y-4"
          >
            <input type="hidden" {...register("role")} value={selectedRole ?? "TENANT"} />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="Adaobi"
                error={errors.firstName?.message}
                required
                {...register("firstName")}
              />
              <Input
                label="Last name"
                placeholder="Okafor"
                error={errors.lastName?.message}
                required
                {...register("lastName")}
              />
            </div>

            <Input
              label="Phone Number"
              placeholder="08012345678"
              type="tel"
              helperText="Nigerian phone number (recommended for faster verification)"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Input
              label="Email Address"
              placeholder="adaobi@example.com"
              type="email"
              helperText="Or provide email instead of phone"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              required
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register("password")}
            />

            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              required
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create account
            </Button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-400">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      )}

      {/* Step 3: Phone OTP verification */}
      {currentStep === 2 && (
        <div>
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0F7B5A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 9.18 19.79 19.79 0 01.42 .5a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.57a16 16 0 006.54 6.54l1.65-1.79a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify your phone</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {registeredData?.phone || registeredData?.identifier}
            </p>
            {sentOtp && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                <p className="text-xs text-amber-700 font-medium">
                  Dev mode: Your OTP is <span className="font-mono font-bold text-amber-900">{sentOtp}</span>
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              error={otpError ?? undefined}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleVerifyOtp}
            isLoading={isVerifying}
            disabled={otpCode.length !== 6}
          >
            Verify & Continue
          </Button>

          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => registeredData?.phone && sendOtp(registeredData.phone)}
              disabled={isSendingOtp}
              className="text-sm text-[#0F7B5A] hover:underline disabled:opacity-50"
            >
              {isSendingOtp ? "Sending..." : "Resend code"}
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleSkipVerification}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
