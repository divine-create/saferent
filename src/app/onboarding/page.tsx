import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TenantOnboarding } from "@/components/onboarding/TenantOnboarding";
import { LandlordOnboarding } from "@/components/onboarding/LandlordOnboarding";
import { AgentOnboarding } from "@/components/onboarding/AgentOnboarding";
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { role } = session.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F7B5A]/5 via-white to-[#D4A017]/5 flex flex-col">
      <header className="bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">SafeRent</span>
          </Link>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">Account Setup</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center py-6 px-4">
        <div className="w-full max-w-lg">
          {role === "TENANT" && <TenantOnboarding />}
          {role === "LANDLORD" && <LandlordOnboarding />}
          {role === "AGENT" && <AgentOnboarding />}
          {role === "ADMIN" && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access</h2>
              <Link href="/admin" className="inline-flex items-center gap-2 bg-[#0F7B5A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0a6049]">
                Go to Admin
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
