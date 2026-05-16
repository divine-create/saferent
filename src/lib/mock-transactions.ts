export type MockTransaction = {
  id: string;
  reference: string;
  listingId: string;
  tenantId: string;
  landlordId: string;
  rentAmount: string;
  cautionAmount: string;
  safeRentFee: string;
  documentFee: string;
  totalAmount: string;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "USSD";
  escrowStatus: "PENDING_PAYMENT" | "FUNDED" | "RELEASED" | "REFUNDED" | "DISPUTED";
  paymentDate: string | null;
  moveInDate: string;
  moveInConfirmedAt: string | null;
  escrowReleasedAt: string | null;
  autoReleaseAt: string | null;
  payoutSentAt: string | null;
  payoutReference: string | null;
  tenancyStartDate: string | null;
  tenancyEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    photos: { url: string }[];
  };
  tenant: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  landlord: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  agreement: {
    id: string;
    tenantLegalName: string;
    landlordLegalName: string;
    propertyAddress: string;
    tenancyStartDate: string;
    tenancyEndDate: string;
    rentAmount: string;
    paymentFrequency: string;
    cautionDeposit: string;
    state: string;
    tenantSignedAt: string | null;
    tenantOtpVerified: boolean;
    landlordSignedAt: string | null;
    landlordOtpVerified: boolean;
    pdfUrl: string | null;
  } | null;
  moveInRecord: {
    id: string;
    scheduledDate: string;
    status: "SCHEDULED" | "CONFIRMED" | "DISPUTED";
    confirmedAt: string | null;
    keysHandedOver: boolean;
  } | null;
  dispute: {
    id: string;
    category: string;
    description: string;
    status: string;
    evidenceDeadline: string | null;
  } | null;
};

export const mockTransactions: MockTransaction[] = [
  {
    id: "mock_tx_1",
    reference: "SR-2026-XK7P2",
    listingId: "mock_1",
    tenantId: "mock_tenant_1",
    landlordId: "u1",
    rentAmount: "450000000",      // ₦4,500,000 in kobo
    cautionAmount: "450000000",   // ₦4,500,000 in kobo
    safeRentFee: "22500000",      // ₦225,000 in kobo
    documentFee: "800000",        // ₦8,000 in kobo
    totalAmount: "923300000",     // total in kobo
    paymentMethod: "BANK_TRANSFER",
    escrowStatus: "FUNDED",
    paymentDate: "2026-05-10T09:23:00.000Z",
    moveInDate: "2026-06-01T08:00:00.000Z",
    moveInConfirmedAt: null,
    escrowReleasedAt: null,
    autoReleaseAt: "2026-06-04T08:00:00.000Z",
    payoutSentAt: null,
    payoutReference: null,
    tenancyStartDate: "2026-06-01T00:00:00.000Z",
    tenancyEndDate: "2027-06-01T00:00:00.000Z",
    createdAt: "2026-05-09T14:00:00.000Z",
    updatedAt: "2026-05-10T09:23:00.000Z",
    listing: {
      id: "mock_1",
      title: "Spacious 3-Bedroom Flat in Lekki Phase 1",
      address: "12 Admiralty Way, Lekki Phase 1",
      area: "Lekki Phase 1",
      state: "Lagos",
      photos: [{ url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800" }],
    },
    tenant: { id: "mock_tenant_1", firstName: "Chukwuemeka", lastName: "Okafor", email: "emeka@example.com" },
    landlord: { id: "u1", firstName: "Adaeze", lastName: "Okonkwo", email: "adaeze@example.com" },
    agreement: {
      id: "mock_agr_1",
      tenantLegalName: "Chukwuemeka Okafor",
      landlordLegalName: "Adaeze Okonkwo",
      propertyAddress: "12 Admiralty Way, Lekki Phase 1, Eti-Osa, Lagos",
      tenancyStartDate: "2026-06-01T00:00:00.000Z",
      tenancyEndDate: "2027-06-01T00:00:00.000Z",
      rentAmount: "450000000",
      paymentFrequency: "ANNUAL",
      cautionDeposit: "450000000",
      state: "Lagos",
      tenantSignedAt: "2026-05-10T10:00:00.000Z",
      tenantOtpVerified: true,
      landlordSignedAt: null,
      landlordOtpVerified: false,
      pdfUrl: null,
    },
    moveInRecord: {
      id: "mock_mr_1",
      scheduledDate: "2026-06-01T08:00:00.000Z",
      status: "SCHEDULED",
      confirmedAt: null,
      keysHandedOver: false,
    },
    dispute: null,
  },
  {
    id: "mock_tx_2",
    reference: "SR-2026-AB9QR",
    listingId: "mock_2",
    tenantId: "mock_tenant_2",
    landlordId: "u2",
    rentAmount: "500000000",      // ₦5,000,000 in kobo
    cautionAmount: "500000000",   // ₦5,000,000 in kobo
    safeRentFee: "25000000",      // ₦250,000 in kobo
    documentFee: "800000",        // ₦8,000 in kobo
    totalAmount: "1025800000",    // total in kobo
    paymentMethod: "CARD",
    escrowStatus: "RELEASED",
    paymentDate: "2026-03-01T11:00:00.000Z",
    moveInDate: "2026-04-01T08:00:00.000Z",
    moveInConfirmedAt: "2026-04-01T10:30:00.000Z",
    escrowReleasedAt: "2026-04-01T10:30:00.000Z",
    autoReleaseAt: "2026-04-04T08:00:00.000Z",
    payoutSentAt: "2026-04-01T12:30:00.000Z",
    payoutReference: "SR-2026-PAY-MN3",
    tenancyStartDate: "2026-04-01T00:00:00.000Z",
    tenancyEndDate: "2027-04-01T00:00:00.000Z",
    createdAt: "2026-02-28T09:00:00.000Z",
    updatedAt: "2026-04-01T12:30:00.000Z",
    listing: {
      id: "mock_2",
      title: "Modern 2-Bedroom Apartment in Maitama",
      address: "Plot 45, Nile Crescent, Maitama",
      area: "Maitama",
      state: "Abuja FCT",
      photos: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" }],
    },
    tenant: { id: "mock_tenant_2", firstName: "Amaka", lastName: "Eze", email: "amaka@example.com" },
    landlord: { id: "u2", firstName: "Emeka", lastName: "Obi", email: "emeka.obi@example.com" },
    agreement: {
      id: "mock_agr_2",
      tenantLegalName: "Amaka Eze",
      landlordLegalName: "Emeka Obi",
      propertyAddress: "Plot 45, Nile Crescent, Maitama, Municipal Area Council, Abuja FCT",
      tenancyStartDate: "2026-04-01T00:00:00.000Z",
      tenancyEndDate: "2027-04-01T00:00:00.000Z",
      rentAmount: "500000000",
      paymentFrequency: "ANNUAL",
      cautionDeposit: "500000000",
      state: "Abuja FCT",
      tenantSignedAt: "2026-03-05T09:00:00.000Z",
      tenantOtpVerified: true,
      landlordSignedAt: "2026-03-06T11:00:00.000Z",
      landlordOtpVerified: true,
      pdfUrl: "/api/agreements/mock_agr_2/pdf",
    },
    moveInRecord: {
      id: "mock_mr_2",
      scheduledDate: "2026-04-01T08:00:00.000Z",
      status: "CONFIRMED",
      confirmedAt: "2026-04-01T10:30:00.000Z",
      keysHandedOver: true,
    },
    dispute: null,
  },
  {
    id: "mock_tx_3",
    reference: "SR-2026-DX4WQ",
    listingId: "mock_4",
    tenantId: "mock_tenant_3",
    landlordId: "u4",
    rentAmount: "800000000",      // ₦8,000,000 in kobo
    cautionAmount: "800000000",   // ₦8,000,000 in kobo
    safeRentFee: "40000000",      // ₦400,000 in kobo
    documentFee: "800000",        // ₦8,000 in kobo
    totalAmount: "1640800000",    // total in kobo
    paymentMethod: "BANK_TRANSFER",
    escrowStatus: "DISPUTED",
    paymentDate: "2026-04-15T08:00:00.000Z",
    moveInDate: "2026-05-01T08:00:00.000Z",
    moveInConfirmedAt: "2026-05-01T09:45:00.000Z",
    escrowReleasedAt: null,
    autoReleaseAt: "2026-05-04T08:00:00.000Z",
    payoutSentAt: null,
    payoutReference: null,
    tenancyStartDate: "2026-05-01T00:00:00.000Z",
    tenancyEndDate: "2027-05-01T00:00:00.000Z",
    createdAt: "2026-04-14T16:00:00.000Z",
    updatedAt: "2026-05-02T11:00:00.000Z",
    listing: {
      id: "mock_4",
      title: "4-Bedroom Duplex in Ikoyi",
      address: "7 Glover Road, Old Ikoyi",
      area: "Old Ikoyi",
      state: "Lagos",
      photos: [{ url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800" }],
    },
    tenant: { id: "mock_tenant_3", firstName: "Biodun", lastName: "Afolabi", email: "biodun@example.com" },
    landlord: { id: "u4", firstName: "Ngozi", lastName: "Eze", email: "ngozi@example.com" },
    agreement: {
      id: "mock_agr_3",
      tenantLegalName: "Biodun Afolabi",
      landlordLegalName: "Ngozi Eze",
      propertyAddress: "7 Glover Road, Old Ikoyi, Eti-Osa, Lagos",
      tenancyStartDate: "2026-05-01T00:00:00.000Z",
      tenancyEndDate: "2027-05-01T00:00:00.000Z",
      rentAmount: "800000000",
      paymentFrequency: "ANNUAL",
      cautionDeposit: "800000000",
      state: "Lagos",
      tenantSignedAt: "2026-04-18T10:00:00.000Z",
      tenantOtpVerified: true,
      landlordSignedAt: "2026-04-19T14:00:00.000Z",
      landlordOtpVerified: true,
      pdfUrl: "/api/agreements/mock_agr_3/pdf",
    },
    moveInRecord: {
      id: "mock_mr_3",
      scheduledDate: "2026-05-01T08:00:00.000Z",
      status: "DISPUTED",
      confirmedAt: "2026-05-01T09:45:00.000Z",
      keysHandedOver: false,
    },
    dispute: {
      id: "mock_dispute_1",
      category: "NOT_AS_DESCRIBED",
      description: "The property was significantly different from what was advertised. The generator did not work, the swimming pool was under construction, and the kitchen fittings were not as shown in the listing photos. Multiple amenities listed were unavailable.",
      status: "EVIDENCE_COLLECTION",
      evidenceDeadline: "2026-05-03T09:45:00.000Z",
    },
  },
];
