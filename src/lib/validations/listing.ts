import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),

  // Type & basics
  propertyType: z.enum([
    "FLAT",
    "SELF_CONTAINED",
    "DUPLEX",
    "BUNGALOW",
    "TERRACED_HOUSE",
    "DETACHED_HOUSE",
    "ROOM_AND_PARLOUR",
    "STUDIO",
  ]),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(20),
  toilets: z.number().int().min(1).max(20),
  floorLevel: z.number().int().min(0).max(50).optional(),
  furnishingStatus: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"]).default("UNFURNISHED"),
  letType: z.enum(["LONG_LET", "SHORT_LET"]).default("LONG_LET"),
  propertyCondition: z.enum(["NEW", "GOOD", "NEEDS_MINOR_WORK"]).default("GOOD"),
  yearBuilt: z.number().int().min(1900).max(2030).optional(),
  availableFrom: z.string().min(1, "Available from date is required"),

  // Location
  address: z.string().min(5, "Address is required"),
  area: z.string().min(2, "Area/neighbourhood is required"),
  lga: z.string().min(2, "LGA is required"),
  state: z.string().min(2, "State is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  landmark: z.string().max(200).optional(),
  neighbourhoodDescription: z.string().max(500).optional(),

  // Pricing
  annualRent: z.number().int().min(1, "Annual rent is required"),
  cautionDeposit: z.number().int().min(0).optional(),
  serviceCharge: z.number().int().min(0).optional(),
  agencyFee: z.number().int().min(0).optional(),
  paymentFrequencies: z.array(z.enum(["ANNUAL", "BIANNUAL", "QUARTERLY", "MONTHLY"])).min(1, "Select at least one payment frequency"),

  // Amenities
  amenities: z.array(z.string()).default([]),

  // Media
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  virtualTourUrl: z.string().url("Invalid virtual tour URL").optional().or(z.literal("")),

  // Documents
  titleDocumentUrl: z.string().optional(),
  surveyPlanUrl: z.string().optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;

export const listingUpdateSchema = listingSchema.partial();
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
