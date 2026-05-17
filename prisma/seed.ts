import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Use plain string literals for Prisma 7 enum compatibility
const UserRole = { TENANT: "TENANT", LANDLORD: "LANDLORD", AGENT: "AGENT", ADMIN: "ADMIN", DEVELOPER: "DEVELOPER" } as const
const VerificationStatus = { NOT_SUBMITTED: "NOT_SUBMITTED", PENDING: "PENDING", VERIFIED: "VERIFIED", FAILED: "FAILED" } as const
const BadgeTier = { NONE: "NONE", ID_VERIFIED: "ID_VERIFIED", PROPERTY_VERIFIED: "PROPERTY_VERIFIED", CERTIFIED: "CERTIFIED" } as const
const AgentPlan = { NONE: "NONE", BASIC: "BASIC", PRO: "PRO", ENTERPRISE: "ENTERPRISE" } as const
const ListingStatus = { DRAFT: "DRAFT", PENDING_VERIFICATION: "PENDING_VERIFICATION", VERIFIED_ACTIVE: "VERIFIED_ACTIVE", UNVERIFIED_ACTIVE: "UNVERIFIED_ACTIVE", PAUSED: "PAUSED", LET_AGREED: "LET_AGREED", OCCUPIED: "OCCUPIED", EXPIRED: "EXPIRED" } as const
const PropertyType = { FLAT: "FLAT", SELF_CONTAINED: "SELF_CONTAINED", DUPLEX: "DUPLEX", BUNGALOW: "BUNGALOW", TERRACED_HOUSE: "TERRACED_HOUSE", DETACHED_HOUSE: "DETACHED_HOUSE", ROOM_AND_PARLOUR: "ROOM_AND_PARLOUR", STUDIO: "STUDIO" } as const
const FurnishingStatus = { UNFURNISHED: "UNFURNISHED", SEMI_FURNISHED: "SEMI_FURNISHED", FULLY_FURNISHED: "FULLY_FURNISHED" } as const
const LetType = { LONG_LET: "LONG_LET", SHORT_LET: "SHORT_LET" } as const
const PaymentFrequency = { ANNUAL: "ANNUAL", BIANNUAL: "BIANNUAL", QUARTERLY: "QUARTERLY", MONTHLY: "MONTHLY" } as const
const PropertyCondition = { NEW: "NEW", GOOD: "GOOD", NEEDS_MINOR_WORK: "NEEDS_MINOR_WORK" } as const

const db = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
} as ConstructorParameters<typeof PrismaClient>[0])

const DEFAULT_PASSWORD = "SafeRent2026!"

async function hash(password: string) {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log("🌱 Seeding SafeRent database...")

  // ─── Clean existing seed data ───────────────────────────────────────────────
  await db.listingPhoto.deleteMany()
  await db.savedListing.deleteMany()
  await db.enquiry.deleteMany()
  await db.listing.deleteMany()
  await db.agentProfile.deleteMany()
  await db.landlordVerification.deleteMany()
  await db.userProfile.deleteMany()
  await db.account.deleteMany()
  await db.session.deleteMany()
  await db.notification.deleteMany()
  await db.user.deleteMany()

  console.log("✓ Cleared existing data")

  // ─── Admin user ──────────────────────────────────────────────────────────────
  const admin = await db.user.create({
    data: {
      email: "admin@saferent.ng",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.ADMIN,
      firstName: "SafeRent",
      lastName: "Admin",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      trustScore: 100,
      onboardingComplete: true,
    },
  })
  console.log("✓ Admin user created:", admin.email)

  // ─── Landlords ───────────────────────────────────────────────────────────────
  const landlord1 = await db.user.create({
    data: {
      email: "babatunde.adeyemi@gmail.com",
      phone: "+2348023456789",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.LANDLORD,
      firstName: "Babatunde",
      lastName: "Adeyemi",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      idDocumentStatus: VerificationStatus.VERIFIED,
      trustScore: 85,
      onboardingComplete: true,
      landlordVerification: {
        create: {
          badgeTier: BadgeTier.CERTIFIED,
          completedTransactions: 4,
        },
      },
    },
  })

  const landlord2 = await db.user.create({
    data: {
      email: "ngozi.okafor@yahoo.com",
      phone: "+2348134567890",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.LANDLORD,
      firstName: "Ngozi",
      lastName: "Okafor",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      idDocumentStatus: VerificationStatus.VERIFIED,
      trustScore: 75,
      onboardingComplete: true,
      landlordVerification: {
        create: {
          badgeTier: BadgeTier.PROPERTY_VERIFIED,
          completedTransactions: 1,
        },
      },
    },
  })

  const landlord3 = await db.user.create({
    data: {
      email: "emeka.nwosu@hotmail.com",
      phone: "+2347012345678",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.LANDLORD,
      firstName: "Emeka",
      lastName: "Nwosu",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      trustScore: 70,
      onboardingComplete: true,
      landlordVerification: {
        create: {
          badgeTier: BadgeTier.ID_VERIFIED,
          completedTransactions: 0,
        },
      },
    },
  })

  const landlord4 = await db.user.create({
    data: {
      email: "fatima.ibrahim@gmail.com",
      phone: "+2348056789012",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.LANDLORD,
      firstName: "Fatima",
      lastName: "Ibrahim",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      idDocumentStatus: VerificationStatus.VERIFIED,
      trustScore: 80,
      onboardingComplete: true,
      landlordVerification: {
        create: {
          badgeTier: BadgeTier.CERTIFIED,
          completedTransactions: 2,
        },
      },
    },
  })

  console.log("✓ Landlords created (4)")

  // ─── Agents ──────────────────────────────────────────────────────────────────
  const agent1 = await db.user.create({
    data: {
      email: "chukwudi.eze@premiumhomes.ng",
      phone: "+2348098765432",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.AGENT,
      firstName: "Chukwudi",
      lastName: "Eze",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      trustScore: 90,
      onboardingComplete: true,
      agentProfile: {
        create: {
          businessName: "Premium Homes Lagos",
          cacNumber: "RC1234567",
          cacVerificationStatus: VerificationStatus.VERIFIED,
          lasreraNumber: "LASRERA/2024/00123",
          lasreraVerificationStatus: VerificationStatus.VERIFIED,
          subscriptionPlan: AgentPlan.PRO,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          bio: "10 years experience in Lagos Island and Lekki corridor. NIESV certified. 200+ successful lets.",
        },
      },
    },
  })

  const agent2 = await db.user.create({
    data: {
      email: "aisha.hassan@abujarealty.ng",
      phone: "+2349012345678",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.AGENT,
      firstName: "Aisha",
      lastName: "Hassan",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      trustScore: 82,
      onboardingComplete: true,
      agentProfile: {
        create: {
          businessName: "Abuja Realty Partners",
          cacNumber: "RC7654321",
          cacVerificationStatus: VerificationStatus.VERIFIED,
          subscriptionPlan: AgentPlan.BASIC,
          subscriptionExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          bio: "Specialist in Maitama, Asokoro and Wuse 2 properties. FCT-based, quick turnaround.",
        },
      },
    },
  })

  console.log("✓ Agents created (2)")

  // ─── Tenants ─────────────────────────────────────────────────────────────────
  const tenant1 = await db.user.create({
    data: {
      email: "adaeze.obi@gmail.com",
      phone: "+2348167890123",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.TENANT,
      firstName: "Adaeze",
      lastName: "Obi",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      ninVerificationStatus: VerificationStatus.VERIFIED,
      idDocumentStatus: VerificationStatus.VERIFIED,
      trustScore: 82,
      onboardingComplete: true,
      profile: {
        create: {
          employmentStatus: "employed",
          employerName: "First Bank Nigeria",
          payslipUploaded: true,
        },
      },
    },
  })

  const tenant2 = await db.user.create({
    data: {
      email: "kelechi.nwachukwu@gmail.com",
      phone: "+2347089012345",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.TENANT,
      firstName: "Kelechi",
      lastName: "Nwachukwu",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      idDocumentStatus: VerificationStatus.VERIFIED,
      trustScore: 65,
      onboardingComplete: true,
      profile: {
        create: {
          employmentStatus: "self_employed",
          bankStatementUploaded: true,
        },
      },
    },
  })

  const tenant3 = await db.user.create({
    data: {
      email: "tunde.williams@outlook.com",
      phone: "+2348023456780",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.TENANT,
      firstName: "Tunde",
      lastName: "Williams",
      isEmailVerified: true,
      isPhoneVerified: false,
      bvnVerificationStatus: VerificationStatus.PENDING,
      trustScore: 20,
      onboardingComplete: false,
    },
  })

  // Diaspora tenant
  const tenant4 = await db.user.create({
    data: {
      email: "chisom.eze@live.co.uk",
      phone: "+447012345678",
      passwordHash: await hash(DEFAULT_PASSWORD),
      role: UserRole.TENANT,
      firstName: "Chisom",
      lastName: "Eze",
      isEmailVerified: true,
      isPhoneVerified: true,
      bvnVerificationStatus: VerificationStatus.VERIFIED,
      idDocumentStatus: VerificationStatus.VERIFIED,
      trustScore: 75,
      preferredCurrency: "GBP",
      isDiaspora: true,
      countryOfResidence: "United Kingdom",
      onboardingComplete: true,
      profile: {
        create: {
          employmentStatus: "employed",
          employerName: "NHS Trust London",
          payslipUploaded: true,
        },
      },
    },
  })

  console.log("✓ Tenants created (4)")

  // ─── Listings ────────────────────────────────────────────────────────────────
  const listings = await Promise.all([
    // 1. Lekki Phase 1 — 3-bed flat (Certified landlord)
    db.listing.create({
      data: {
        title: "Luxury 3-Bedroom Flat in Lekki Phase 1",
        description: "Spacious and well-finished 3-bedroom flat in a serene estate in Lekki Phase 1. Features fitted kitchen, 24/7 security, dedicated parking, and constant water supply. Walking distance to Lekki-Epe expressway and close to The Palms Shopping Mall.",
        slug: "luxury-3bed-flat-lekki-phase-1-001",
        ownerId: landlord1.id,
        propertyType: PropertyType.FLAT,
        bedrooms: 3,
        bathrooms: 3,
        toilets: 4,
        floorLevel: 2,
        furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        yearBuilt: 2019,
        availableFrom: new Date(),
        address: "14 Admiralty Way, Lekki Phase 1",
        area: "Lekki Phase 1",
        lga: "Eti-Osa",
        state: "Lagos",
        latitude: 6.4281,
        longitude: 3.4219,
        landmark: "Near The Palms Shopping Mall",
        neighbourhoodDescription: "Quiet residential street with 24/7 security patrol. Close to Lekki Conservation Centre and major shopping outlets.",
        annualRent: BigInt(3200000),
        cautionDeposit: BigInt(1600000),
        serviceCharge: BigInt(300000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        viewCount: 142,
        enquiryCount: 18,
        isDiasporaReady: true,
        amenities: ["generator", "borehole", "prepaid_meter", "fitted_kitchen", "security", "parking", "cctv"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", order: 0, caption: "Living room" },
            { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", order: 1, caption: "Master bedroom" },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", order: 2, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", order: 3, caption: "Bathroom" },
            { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", order: 4, caption: "Second bedroom" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 2. Ikeja GRA — 4-bed detached (Agent listing)
    db.listing.create({
      data: {
        title: "4-Bedroom Detached House in Ikeja GRA",
        description: "Well-maintained 4-bedroom detached house with BQ in the prestigious Ikeja GRA. Recently renovated with modern finishes. Features central AC, large compound with garden, and 3-car parking. Close to MMA2 airport and LASUTH.",
        slug: "4bed-detached-ikeja-gra-002",
        ownerId: landlord2.id,
        agentId: agent1.id,
        propertyType: PropertyType.DETACHED_HOUSE,
        bedrooms: 4,
        bathrooms: 4,
        toilets: 5,
        furnishingStatus: FurnishingStatus.UNFURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        yearBuilt: 2015,
        availableFrom: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        address: "7 Association Avenue, Ikeja GRA",
        area: "Ikeja GRA",
        lga: "Ikeja",
        state: "Lagos",
        latitude: 6.6018,
        longitude: 3.3515,
        landmark: "Off Mobolaji Bank Anthony Way",
        neighbourhoodDescription: "One of Lagos' most prestigious residential areas. Quiet, tree-lined streets with constant electricity and excellent security.",
        annualRent: BigInt(5500000),
        cautionDeposit: BigInt(2750000),
        agencyFee: BigInt(550000),
        paymentFrequencies: [PaymentFrequency.ANNUAL],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        viewCount: 89,
        enquiryCount: 12,
        amenities: ["generator", "borehole", "central_ac", "fitted_kitchen", "bq", "security", "parking", "garden"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", order: 0, caption: "Front view" },
            { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", order: 1, caption: "Living room" },
            { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", order: 2, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", order: 3, caption: "Master bedroom" },
            { url: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800", order: 4, caption: "Compound" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 3. Surulere — 2-bed flat (affordable)
    db.listing.create({
      data: {
        title: "Modern 2-Bedroom Flat in Surulere",
        description: "Clean and modern 2-bedroom flat in a quiet street in Surulere. Prepaid meter, constant borehole water, and secure compound. Perfect for young professionals. Close to National Stadium and excellent road access.",
        slug: "modern-2bed-flat-surulere-003",
        ownerId: landlord3.id,
        propertyType: PropertyType.FLAT,
        bedrooms: 2,
        bathrooms: 2,
        toilets: 2,
        floorLevel: 1,
        furnishingStatus: FurnishingStatus.UNFURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        availableFrom: new Date(),
        address: "22 Adeniran Ogunsanya Street, Surulere",
        area: "Surulere",
        lga: "Surulere",
        state: "Lagos",
        latitude: 6.5000,
        longitude: 3.3601,
        landmark: "Near National Stadium",
        annualRent: BigInt(1100000),
        cautionDeposit: BigInt(550000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL, PaymentFrequency.QUARTERLY],
        status: ListingStatus.UNVERIFIED_ACTIVE,
        isVerified: false,
        viewCount: 67,
        enquiryCount: 9,
        amenities: ["borehole", "prepaid_meter", "security", "parking"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", order: 0, caption: "Living area" },
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", order: 1, caption: "Bedroom" },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", order: 2, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", order: 3, caption: "Bathroom" },
            { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", order: 4, caption: "Compound" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 4. Victoria Island — studio short let
    db.listing.create({
      data: {
        title: "Fully Furnished Studio on Victoria Island",
        description: "Stylish fully-furnished studio apartment on Victoria Island. Ideal for executives and short-term stays. All utilities included, high-speed WiFi, 24/7 security and concierge. Walking distance to major banks and corporate offices.",
        slug: "furnished-studio-victoria-island-004",
        ownerId: landlord1.id,
        propertyType: PropertyType.STUDIO,
        bedrooms: 0,
        bathrooms: 1,
        toilets: 1,
        floorLevel: 5,
        furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
        letType: LetType.SHORT_LET,
        propertyCondition: PropertyCondition.NEW,
        yearBuilt: 2022,
        availableFrom: new Date(),
        address: "Plot 1649 Adeola Hopewell Street, Victoria Island",
        area: "Victoria Island",
        lga: "Eti-Osa",
        state: "Lagos",
        latitude: 6.4281,
        longitude: 3.4219,
        landmark: "Near Eko Hotel",
        annualRent: BigInt(4500000),
        cautionDeposit: BigInt(1000000),
        serviceCharge: BigInt(600000),
        paymentFrequencies: [PaymentFrequency.MONTHLY, PaymentFrequency.QUARTERLY],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        isDiasporaReady: true,
        viewCount: 203,
        enquiryCount: 31,
        amenities: ["generator", "central_ac", "fitted_kitchen", "security", "parking", "elevator", "gym", "swimming_pool", "wifi"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800", order: 0, caption: "Studio living space" },
            { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800", order: 1, caption: "Sleeping area" },
            { url: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800", order: 2, caption: "Kitchenette" },
            { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", order: 3, caption: "Bathroom" },
            { url: "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800", order: 4, caption: "City view" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 5. Maitama, Abuja — 3-bed duplex (Agent listing)
    db.listing.create({
      data: {
        title: "Executive 3-Bedroom Duplex in Maitama",
        description: "Beautifully finished executive duplex in the heart of Maitama, Abuja. Features marble floors, fitted wardrobes, American kitchen, and a landscaped garden. Located in a secure estate with 24/7 security and CCTV.",
        slug: "executive-3bed-duplex-maitama-005",
        ownerId: landlord4.id,
        agentId: agent2.id,
        propertyType: PropertyType.DUPLEX,
        bedrooms: 3,
        bathrooms: 3,
        toilets: 4,
        furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.NEW,
        yearBuilt: 2021,
        availableFrom: new Date(),
        address: "14 Panama Street, Maitama",
        area: "Maitama",
        lga: "Municipal Area Council",
        state: "Abuja FCT",
        latitude: 9.0820,
        longitude: 7.4891,
        landmark: "Near NNPC Towers",
        neighbourhoodDescription: "Maitama is Abuja's most exclusive residential district, home to embassies, senior government officials, and top executives.",
        annualRent: BigInt(6500000),
        cautionDeposit: BigInt(3250000),
        agencyFee: BigInt(650000),
        serviceCharge: BigInt(400000),
        paymentFrequencies: [PaymentFrequency.ANNUAL],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        isDiasporaReady: true,
        viewCount: 118,
        enquiryCount: 22,
        amenities: ["generator", "borehole", "central_ac", "fitted_kitchen", "bq", "security", "parking", "garden", "cctv"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800", order: 0, caption: "Front exterior" },
            { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800", order: 1, caption: "Living room" },
            { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800", order: 2, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", order: 3, caption: "Master bedroom" },
            { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800", order: 4, caption: "Garden" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 6. Yaba — self-contained
    db.listing.create({
      data: {
        title: "Self-Contained 1-Bedroom in Yaba (Tech Hub Area)",
        description: "Compact and well-maintained self-contained apartment perfect for tech professionals and students. Close to University of Lagos, CMS Grammar School, and the Yaba tech cluster. Prepaid meter and good water supply.",
        slug: "self-contained-1bed-yaba-006",
        ownerId: landlord3.id,
        propertyType: PropertyType.SELF_CONTAINED,
        bedrooms: 1,
        bathrooms: 1,
        toilets: 1,
        floorLevel: 0,
        furnishingStatus: FurnishingStatus.UNFURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        availableFrom: new Date(),
        address: "5 Commercial Avenue, Yaba",
        area: "Yaba",
        lga: "Mainland",
        state: "Lagos",
        latitude: 6.5158,
        longitude: 3.3718,
        landmark: "Near UNILAG gate",
        annualRent: BigInt(500000),
        cautionDeposit: BigInt(250000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL, PaymentFrequency.QUARTERLY],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        viewCount: 98,
        enquiryCount: 24,
        amenities: ["borehole", "prepaid_meter", "security"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800", order: 0, caption: "Room" },
            { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", order: 1, caption: "Compound" },
            { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", order: 2, caption: "Bathroom" },
            { url: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800", order: 3, caption: "Kitchenette" },
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", order: 4, caption: "Interior" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 7. Wuse 2, Abuja — 2-bed flat
    db.listing.create({
      data: {
        title: "2-Bedroom Flat in Wuse 2",
        description: "Well-finished 2-bedroom flat in a serene street in Wuse 2. Tiled throughout, fitted kitchen, constant electricity from AEDC and a backup generator. Walking distance to major banks, restaurants and Banex Plaza.",
        slug: "2bed-flat-wuse-2-007",
        ownerId: landlord4.id,
        propertyType: PropertyType.FLAT,
        bedrooms: 2,
        bathrooms: 2,
        toilets: 3,
        floorLevel: 1,
        furnishingStatus: FurnishingStatus.UNFURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        yearBuilt: 2018,
        availableFrom: new Date(),
        address: "Plot 315 Aminu Kano Crescent, Wuse 2",
        area: "Wuse 2",
        lga: "Municipal Area Council",
        state: "Abuja FCT",
        latitude: 9.0625,
        longitude: 7.4836,
        landmark: "Near Banex Plaza",
        annualRent: BigInt(2800000),
        cautionDeposit: BigInt(1400000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        viewCount: 74,
        enquiryCount: 11,
        amenities: ["generator", "borehole", "prepaid_meter", "security", "parking"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800", order: 0, caption: "Living room" },
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", order: 1, caption: "Bedroom" },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", order: 2, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", order: 3, caption: "Bathroom" },
            { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", order: 4, caption: "Second bedroom" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 8. Ajah — 3-bed bungalow (pending verification)
    db.listing.create({
      data: {
        title: "3-Bedroom Bungalow in Ajah",
        description: "Spacious 3-bedroom bungalow with large compound in Ajah. Ideal for families. Has a BQ, bore hole with overhead tank, and is close to Ajah market and Abraham Adesanya Estate.",
        slug: "3bed-bungalow-ajah-008",
        ownerId: landlord2.id,
        propertyType: PropertyType.BUNGALOW,
        bedrooms: 3,
        bathrooms: 2,
        toilets: 3,
        furnishingStatus: FurnishingStatus.UNFURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        availableFrom: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        address: "12 Addo Road, Ajah",
        area: "Ajah",
        lga: "Eti-Osa",
        state: "Lagos",
        latitude: 6.4674,
        longitude: 3.5675,
        landmark: "Off Lekki-Epe Expressway",
        annualRent: BigInt(1800000),
        cautionDeposit: BigInt(900000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL],
        status: ListingStatus.PENDING_VERIFICATION,
        isVerified: false,
        viewCount: 23,
        enquiryCount: 3,
        amenities: ["borehole", "prepaid_meter", "bq", "parking"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", order: 0, caption: "Front view" },
            { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", order: 1, caption: "Living room" },
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", order: 2, caption: "Bedroom" },
            { url: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800", order: 3, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", order: 4, caption: "Compound" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 9. Ikoyi — high-end 4-bed (Certified landlord, diaspora)
    db.listing.create({
      data: {
        title: "Premium 4-Bedroom Penthouse in Ikoyi",
        description: "Ultra-premium penthouse apartment on the top floor of a luxury high-rise in Ikoyi. Panoramic views of Lagos Lagoon. Features smart home system, concierge service, swimming pool and gym. Ideal for C-suite executives and returning diaspora.",
        slug: "premium-4bed-penthouse-ikoyi-009",
        ownerId: landlord1.id,
        propertyType: PropertyType.FLAT,
        bedrooms: 4,
        bathrooms: 4,
        toilets: 5,
        floorLevel: 12,
        furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.NEW,
        yearBuilt: 2023,
        availableFrom: new Date(),
        address: "Bourdillon Road, Ikoyi",
        area: "Ikoyi",
        lga: "Eti-Osa",
        state: "Lagos",
        latitude: 6.4541,
        longitude: 3.4368,
        landmark: "Off Bourdillon Road",
        neighbourhoodDescription: "Ikoyi is Lagos' most prestigious address — home to foreign embassies, top financial institutions, and Nigeria's elite.",
        annualRent: BigInt(9500000),
        cautionDeposit: BigInt(4750000),
        serviceCharge: BigInt(1200000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        isDiasporaReady: true,
        viewCount: 312,
        enquiryCount: 47,
        amenities: ["generator", "central_ac", "fitted_kitchen", "security", "parking", "elevator", "gym", "swimming_pool", "cctv", "wifi", "smart_home"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", order: 0, caption: "Penthouse exterior" },
            { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", order: 1, caption: "Open plan living" },
            { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800", order: 2, caption: "Chef kitchen" },
            { url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800", order: 3, caption: "Master suite" },
            { url: "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800", order: 4, caption: "Lagoon view" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),

    // 10. Port Harcourt — 2-bed flat
    db.listing.create({
      data: {
        title: "2-Bedroom Flat in GRA Phase 2, Port Harcourt",
        description: "Tastefully finished 2-bedroom flat in GRA Phase 2, Port Harcourt. Tiled throughout, fitted kitchen and wardrobe. Constant PHCCL supply with backup generator. Good road network and close to major oil company offices.",
        slug: "2bed-flat-gra-port-harcourt-010",
        ownerId: landlord2.id,
        propertyType: PropertyType.FLAT,
        bedrooms: 2,
        bathrooms: 2,
        toilets: 2,
        floorLevel: 0,
        furnishingStatus: FurnishingStatus.UNFURNISHED,
        letType: LetType.LONG_LET,
        propertyCondition: PropertyCondition.GOOD,
        availableFrom: new Date(),
        address: "15 Ada George Road, GRA Phase 2",
        area: "GRA Phase 2",
        lga: "Port Harcourt",
        state: "Rivers",
        latitude: 4.8165,
        longitude: 7.0498,
        landmark: "Near SPDC Office",
        annualRent: BigInt(1400000),
        cautionDeposit: BigInt(700000),
        paymentFrequencies: [PaymentFrequency.ANNUAL, PaymentFrequency.BIANNUAL],
        status: ListingStatus.VERIFIED_ACTIVE,
        isVerified: true,
        viewCount: 55,
        enquiryCount: 8,
        amenities: ["generator", "borehole", "prepaid_meter", "security", "parking"],
        photos: {
          create: [
            { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", order: 0, caption: "Living room" },
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", order: 1, caption: "Bedroom" },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", order: 2, caption: "Kitchen" },
            { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", order: 3, caption: "Bathroom" },
            { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", order: 4, caption: "Second bedroom" },
          ],
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log(`✓ Listings created (${listings.length})`)

  // ─── Notifications for tenant1 ───────────────────────────────────────────────
  await db.notification.createMany({
    data: [
      {
        userId: tenant1.id,
        type: "NEW_LISTING_MATCH",
        title: "New listing matches your search",
        body: "A new 3-bedroom flat in Lekki Phase 1 was just listed — ₦3,200,000/yr",
        actionUrl: `/listings/${listings[0].id}`,
        isRead: false,
      },
      {
        userId: tenant1.id,
        type: "SYSTEM",
        title: "Welcome to SafeRent!",
        body: "Your account is verified. Start browsing thousands of verified properties.",
        actionUrl: "/listings",
        isRead: true,
      },
    ],
  })

  // ─── Saved listings for tenant1 ──────────────────────────────────────────────
  await db.savedListing.createMany({
    data: [
      { userId: tenant1.id, listingId: listings[0].id },
      { userId: tenant1.id, listingId: listings[4].id },
    ],
  })

  // ─── Enquiries ───────────────────────────────────────────────────────────────
  await db.enquiry.createMany({
    data: [
      {
        userId: tenant1.id,
        listingId: listings[0].id,
        message: "Good day, I'm interested in this property. Is it still available? I'd like to schedule a viewing at your earliest convenience.",
      },
      {
        userId: tenant2.id,
        listingId: listings[2].id,
        message: "Please, is the property still available? I'm ready to pay immediately if all checks out.",
      },
    ],
  })

  console.log("✓ Saved listings and enquiries created")

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n🎉 Database seeded successfully!\n")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Test accounts (password: SafeRent2026!)")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  ADMIN    admin@saferent.ng")
  console.log("  LANDLORD babatunde.adeyemi@gmail.com  (Gold badge)")
  console.log("  LANDLORD ngozi.okafor@yahoo.com       (Silver badge)")
  console.log("  LANDLORD fatima.ibrahim@gmail.com     (Gold badge)")
  console.log("  AGENT    chukwudi.eze@premiumhomes.ng (Pro, LASRERA verified)")
  console.log("  AGENT    aisha.hassan@abujarealty.ng  (Basic plan)")
  console.log("  TENANT   adaeze.obi@gmail.com         (Trust score: 82)")
  console.log("  TENANT   kelechi.nwachukwu@gmail.com  (Trust score: 65)")
  console.log("  TENANT   chisom.eze@live.co.uk        (Diaspora, GBP)")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`  ${listings.length} listings seeded across Lagos, Abuja & Port Harcourt`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
