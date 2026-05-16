import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockListings } from "@/lib/mock-listings";
import { PaymentFlow } from "@/components/payment/PaymentFlow";

type PageProps = { params: Promise<{ id: string }> };

async function getListing(id: string) {
  try {
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" }, take: 3 },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!listing) return null;
    return {
      ...listing,
      annualRent: listing.annualRent.toString(),
      cautionDeposit: listing.cautionDeposit?.toString() ?? null,
      serviceCharge: listing.serviceCharge?.toString() ?? null,
      agencyFee: listing.agencyFee?.toString() ?? null,
    };
  } catch {
    const mock = mockListings.find((l) => l.id === id);
    if (!mock) return null;
    return {
      ...mock,
      annualRent: (mock.annualRent * 100).toString(), // convert to kobo
      cautionDeposit: mock.cautionDeposit ? (mock.cautionDeposit * 100).toString() : null,
      serviceCharge: null,
      agencyFee: null,
      photos: mock.photos,
      owner: { id: mock.owner.id, firstName: mock.owner.firstName, lastName: mock.owner.lastName, email: null },
    };
  }
}

export default async function PayPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) redirect(`/login?callbackUrl=/listings/${id}/pay`);
  if (session.user.role !== "TENANT") redirect(`/listings/${id}`);

  const listing = await getListing(id);
  if (!listing) notFound();

  if (listing.status !== "VERIFIED_ACTIVE" && listing.status !== "UNVERIFIED_ACTIVE") {
    redirect(`/listings/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Secure Your New Home</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Your payment is held in escrow — only released after successful move-in.
          </p>
        </div>
        <PaymentFlow listing={listing as Parameters<typeof PaymentFlow>[0]["listing"]} />
      </div>
    </div>
  );
}
