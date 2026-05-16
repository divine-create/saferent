import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateListingForm } from "@/components/listings/CreateListingForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD" && session.user.role !== "AGENT") {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/landlord/listings"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 text-sm mt-1">
          List your property on SafeRent and reach verified tenants across Nigeria.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <CreateListingForm role={session.user.role} />
      </div>
    </div>
  );
}
