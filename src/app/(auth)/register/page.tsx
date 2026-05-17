"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoleCard } from "@/components/ui/RoleCard";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Home, Building2, Briefcase, Eye, EyeOff, ArrowLeft, ArrowRight, LayoutDashboard, Mail, CheckCircle } from "lucide-react";

const STEPS = [
  { label: "Role", description: "Choose account type" },
  { label: "Details", description: "Personal information" },
  { label: "Confirm", description: "Check your email" },
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
  {
    value: "DEVELOPER" as const,
    title: "Developer / Estate Company",
    description: "Property developer or estate management company with 10+ units",
    icon: <LayoutDashboard className="w-6 h-6" />,
    features: [
      "Portfolio-wide unit management",
      "Bulk CSV import/export",
      "Enterprise analytics & reporting",
      "Dedicated account manager",
    ],
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<"TENANT" | "LANDLORD" | "AGENT" | "DEVELOPER" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "TENANT" },
  });

  const handleRoleSelect = (role: "TENANT" | "LANDLORD" | "AGENT" | "DEVELOPER") => {
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

      setRegisteredEmail(data.email || null);
      setCurrentStep(2);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const handleContinueToApp = async () => {
    setIsSigningIn(true);
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
    setIsSigningIn(false);
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < currentStep
                  ? "bg-[#0F7B5A] text-white"
                  : i === currentStep
                  ? "bg-[#0F7B5A] text-white ring-4 ring-[#0F7B5A]/20"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {i < currentStep ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (i + 1)}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold ${i === currentStep ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${i < currentStep ? "bg-[#0F7B5A]" : "bg-gray-200"}`} style={{ width: "40px" }} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#0F7B5A] rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Role selection */}
      {currentStep === 0 && (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Join SafeRent</h1>
            <p className="text-gray-500">How will you use SafeRent?</p>
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
            className="w-full mt-5 !h-12 text-base font-bold rounded-xl"
            size="lg"
            onClick={goToStep2}
            disabled={!selectedRole}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue
          </Button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0F7B5A] font-bold hover:underline">
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

          <form onSubmit={handleSubmit(handleStep2Submit)} className="space-y-4">
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
              helperText="Nigerian phone number (optional)"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Input
              label="Email Address"
              placeholder="adaobi@example.com"
              type="email"
              helperText="A verification link will be sent to this email"
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

      {/* Step 3: Email confirmation sent */}
      {currentStep === 2 && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center mx-auto mb-5">
            {registeredEmail ? (
              <Mail className="w-8 h-8 text-[#0F7B5A]" />
            ) : (
              <CheckCircle className="w-8 h-8 text-[#0F7B5A]" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h1>

          {registeredEmail ? (
            <>
              <p className="text-gray-500 text-sm mb-1">A verification link has been sent to</p>
              <p className="font-semibold text-gray-800 mb-4">{registeredEmail}</p>
              <p className="text-gray-400 text-xs mb-6">
                Click the link in your email to verify your account. You can still access the platform while you wait.
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm mb-6">
              Your account is ready. Continue to complete your profile setup.
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleContinueToApp}
            isLoading={isSigningIn}
          >
            Continue to SafeRent
          </Button>

          {registeredEmail && (
            <p className="mt-3 text-xs text-gray-400">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link href="/login" className="text-[#0F7B5A] hover:underline">
                sign in anyway
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
