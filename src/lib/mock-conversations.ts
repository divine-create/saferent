// Mock conversations for development/fallback
export type MockMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: "TEXT" | "IMAGE" | "PDF" | "SYSTEM";
  content: string;
  mediaUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  systemEventType?: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePhoto?: string | null;
    role: string;
  };
};

export type MockConversation = {
  id: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  lastMessageAt: string | null;
  lastMessageText: string | null;
  tenantUnread: number;
  ownerUnread: number;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    area: string;
    address: string;
    photos: { url: string }[];
  };
  tenant: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePhoto?: string | null;
    role: string;
    landlordVerification?: { badgeTier: string } | null;
  };
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePhoto?: string | null;
    role: string;
    landlordVerification?: { badgeTier: string } | null;
  };
  messages: MockMessage[];
};

// Mock user IDs — in a real session the current user would be one of these
export const MOCK_CURRENT_TENANT_ID = "mock_tenant_chidi";
export const MOCK_CURRENT_LANDLORD_ID = "mock_landlord_amaka";

export const mockConversations: MockConversation[] = [
  // Conversation 1: Chidi (tenant) ↔ Adaeze (landlord) — Lekki flat, 4 messages
  {
    id: "conv_1",
    listingId: "mock_1",
    tenantId: MOCK_CURRENT_TENANT_ID,
    ownerId: "mock_owner_adaeze",
    lastMessageAt: "2026-05-16T11:30:00.000Z",
    lastMessageText: "The generator runs every day 6am–11pm and there's an inverter backup for overnight.",
    tenantUnread: 1,
    ownerUnread: 0,
    createdAt: "2026-05-14T09:00:00.000Z",
    updatedAt: "2026-05-16T11:30:00.000Z",
    listing: {
      id: "mock_1",
      title: "Spacious 3-Bedroom Flat in Lekki Phase 1",
      area: "Lekki Phase 1",
      address: "12 Admiralty Way, Lekki Phase 1",
      photos: [
        { url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800" },
      ],
    },
    tenant: {
      id: MOCK_CURRENT_TENANT_ID,
      firstName: "Chidi",
      lastName: "Nwosu",
      profilePhoto: null,
      role: "TENANT",
      landlordVerification: null,
    },
    owner: {
      id: "mock_owner_adaeze",
      firstName: "Adaeze",
      lastName: "Okonkwo",
      profilePhoto: null,
      role: "LANDLORD",
      landlordVerification: { badgeTier: "CERTIFIED" },
    },
    messages: [
      {
        id: "msg_1_1",
        conversationId: "conv_1",
        senderId: "system",
        type: "SYSTEM",
        content: "Conversation started about Spacious 3-Bedroom Flat in Lekki Phase 1",
        isRead: true,
        readAt: "2026-05-14T09:00:00.000Z",
        systemEventType: "CONVERSATION_STARTED",
        createdAt: "2026-05-14T09:00:00.000Z",
        sender: { id: "system", firstName: "SafeRent", lastName: null, role: "SYSTEM" },
      },
      {
        id: "msg_1_2",
        conversationId: "conv_1",
        senderId: MOCK_CURRENT_TENANT_ID,
        type: "TEXT",
        content: "Good morning Ma. I saw your listing on SafeRent. I'm very interested in the 3-bedroom flat. Is the property still available and can we schedule a viewing this week?",
        isRead: true,
        readAt: "2026-05-14T10:15:00.000Z",
        createdAt: "2026-05-14T09:05:00.000Z",
        sender: { id: MOCK_CURRENT_TENANT_ID, firstName: "Chidi", lastName: "Nwosu", role: "TENANT" },
      },
      {
        id: "msg_1_3",
        conversationId: "conv_1",
        senderId: "mock_owner_adaeze",
        type: "TEXT",
        content: "Hello Chidi! Yes, the flat is still available. I can show you around on Saturday at 10am or Sunday at 2pm. Which works better for you? Please make sure your profile verification is complete before the viewing.",
        isRead: true,
        readAt: "2026-05-14T11:00:00.000Z",
        createdAt: "2026-05-14T10:15:00.000Z",
        sender: { id: "mock_owner_adaeze", firstName: "Adaeze", lastName: "Okonkwo", role: "LANDLORD" },
      },
      {
        id: "msg_1_4",
        conversationId: "conv_1",
        senderId: MOCK_CURRENT_TENANT_ID,
        type: "TEXT",
        content: "Saturday at 10am is perfect. One quick question — how long does the generator run daily? I work from home so reliable power is very important to me.",
        isRead: true,
        readAt: "2026-05-16T11:30:00.000Z",
        createdAt: "2026-05-16T10:45:00.000Z",
        sender: { id: MOCK_CURRENT_TENANT_ID, firstName: "Chidi", lastName: "Nwosu", role: "TENANT" },
      },
      {
        id: "msg_1_5",
        conversationId: "conv_1",
        senderId: "mock_owner_adaeze",
        type: "TEXT",
        content: "The generator runs every day 6am–11pm and there's an inverter backup for overnight.",
        isRead: false,
        readAt: null,
        createdAt: "2026-05-16T11:30:00.000Z",
        sender: { id: "mock_owner_adaeze", firstName: "Adaeze", lastName: "Okonkwo", role: "LANDLORD" },
      },
    ],
  },

  // Conversation 2: Chidi (tenant) ↔ Babatunde (landlord) — Ikeja duplex, 2 messages, 1 unread
  {
    id: "conv_2",
    listingId: "mock_7",
    tenantId: MOCK_CURRENT_TENANT_ID,
    ownerId: "mock_owner_babatunde",
    lastMessageAt: "2026-05-15T16:20:00.000Z",
    lastMessageText: "We accept quarterly payments. Agency fee is one month rent. Come and see the place first sha.",
    tenantUnread: 1,
    ownerUnread: 0,
    createdAt: "2026-05-15T14:00:00.000Z",
    updatedAt: "2026-05-15T16:20:00.000Z",
    listing: {
      id: "mock_7",
      title: "1-Bedroom Flat in Ikeja GRA",
      area: "Ikeja GRA",
      address: "5 Mobolaji Bank-Anthony Way, Ikeja GRA",
      photos: [
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
      ],
    },
    tenant: {
      id: MOCK_CURRENT_TENANT_ID,
      firstName: "Chidi",
      lastName: "Nwosu",
      profilePhoto: null,
      role: "TENANT",
      landlordVerification: null,
    },
    owner: {
      id: "mock_owner_babatunde",
      firstName: "Babatunde",
      lastName: "Adeleke",
      profilePhoto: null,
      role: "LANDLORD",
      landlordVerification: { badgeTier: "ID_VERIFIED" },
    },
    messages: [
      {
        id: "msg_2_1",
        conversationId: "conv_2",
        senderId: "system",
        type: "SYSTEM",
        content: "Conversation started about 1-Bedroom Flat in Ikeja GRA",
        isRead: true,
        readAt: "2026-05-15T14:00:00.000Z",
        systemEventType: "CONVERSATION_STARTED",
        createdAt: "2026-05-15T14:00:00.000Z",
        sender: { id: "system", firstName: "SafeRent", lastName: null, role: "SYSTEM" },
      },
      {
        id: "msg_2_2",
        conversationId: "conv_2",
        senderId: MOCK_CURRENT_TENANT_ID,
        type: "TEXT",
        content: "Good afternoon sir. I'm interested in the 1-bedroom flat in Ikeja GRA. Do you accept quarterly payment? Also what is the agency fee arrangement?",
        isRead: true,
        readAt: "2026-05-15T16:00:00.000Z",
        createdAt: "2026-05-15T14:05:00.000Z",
        sender: { id: MOCK_CURRENT_TENANT_ID, firstName: "Chidi", lastName: "Nwosu", role: "TENANT" },
      },
      {
        id: "msg_2_3",
        conversationId: "conv_2",
        senderId: "mock_owner_babatunde",
        type: "TEXT",
        content: "We accept quarterly payments. Agency fee is one month rent. Come and see the place first sha.",
        isRead: false,
        readAt: null,
        createdAt: "2026-05-15T16:20:00.000Z",
        sender: { id: "mock_owner_babatunde", firstName: "Babatunde", lastName: "Adeleke", role: "LANDLORD" },
      },
    ],
  },

  // Conversation 3: Fatima (tenant) ↔ Chidi (as landlord perspective for demo) — Surulere, parking question
  {
    id: "conv_3",
    listingId: "mock_5",
    tenantId: "mock_tenant_fatima",
    ownerId: MOCK_CURRENT_TENANT_ID, // Chidi is the owner here (landlord mode)
    lastMessageAt: "2026-05-16T08:15:00.000Z",
    lastMessageText: "There are 2 dedicated parking spaces in the compound. One will be allocated to your unit.",
    tenantUnread: 0,
    ownerUnread: 0,
    createdAt: "2026-05-15T20:00:00.000Z",
    updatedAt: "2026-05-16T08:15:00.000Z",
    listing: {
      id: "mock_5",
      title: "2-Bedroom Flat in Surulere",
      area: "Surulere",
      address: "15 Adeniran Ogunsanya Street, Surulere",
      photos: [
        { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800" },
      ],
    },
    tenant: {
      id: "mock_tenant_fatima",
      firstName: "Fatima",
      lastName: "Usman",
      profilePhoto: null,
      role: "TENANT",
      landlordVerification: null,
    },
    owner: {
      id: MOCK_CURRENT_TENANT_ID,
      firstName: "Chidi",
      lastName: "Nwosu",
      profilePhoto: null,
      role: "LANDLORD",
      landlordVerification: { badgeTier: "ID_VERIFIED" },
    },
    messages: [
      {
        id: "msg_3_1",
        conversationId: "conv_3",
        senderId: "system",
        type: "SYSTEM",
        content: "Conversation started about 2-Bedroom Flat in Surulere",
        isRead: true,
        readAt: "2026-05-15T20:00:00.000Z",
        systemEventType: "CONVERSATION_STARTED",
        createdAt: "2026-05-15T20:00:00.000Z",
        sender: { id: "system", firstName: "SafeRent", lastName: null, role: "SYSTEM" },
      },
      {
        id: "msg_3_2",
        conversationId: "conv_3",
        senderId: "mock_tenant_fatima",
        type: "TEXT",
        content: "Good evening. I'm a working professional and I drive to work every day. Does the property have dedicated parking space? I don't want to be parking on the street.",
        isRead: true,
        readAt: "2026-05-16T07:00:00.000Z",
        createdAt: "2026-05-15T20:05:00.000Z",
        sender: { id: "mock_tenant_fatima", firstName: "Fatima", lastName: "Usman", role: "TENANT" },
      },
      {
        id: "msg_3_3",
        conversationId: "conv_3",
        senderId: MOCK_CURRENT_TENANT_ID,
        type: "TEXT",
        content: "There are 2 dedicated parking spaces in the compound. One will be allocated to your unit.",
        isRead: true,
        readAt: "2026-05-16T08:30:00.000Z",
        createdAt: "2026-05-16T08:15:00.000Z",
        sender: { id: MOCK_CURRENT_TENANT_ID, firstName: "Chidi", lastName: "Nwosu", role: "LANDLORD" },
      },
    ],
  },

  // Conversation 4: Amaka (tenant) ↔ Emeka (landlord) — Maitama apartment
  {
    id: "conv_4",
    listingId: "mock_2",
    tenantId: "mock_tenant_amaka",
    ownerId: MOCK_CURRENT_LANDLORD_ID,
    lastMessageAt: "2026-05-13T14:00:00.000Z",
    lastMessageText: "Thank you for your interest! I've confirmed your viewing for Saturday 17th May at 2pm. Please arrive on time.",
    tenantUnread: 1,
    ownerUnread: 0,
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-13T14:00:00.000Z",
    listing: {
      id: "mock_2",
      title: "Modern 2-Bedroom Apartment in Maitama",
      area: "Maitama",
      address: "Plot 45, Nile Crescent, Maitama",
      photos: [
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" },
      ],
    },
    tenant: {
      id: "mock_tenant_amaka",
      firstName: "Amaka",
      lastName: "Obi",
      profilePhoto: null,
      role: "TENANT",
      landlordVerification: null,
    },
    owner: {
      id: MOCK_CURRENT_LANDLORD_ID,
      firstName: "Emeka",
      lastName: "Obi",
      profilePhoto: null,
      role: "LANDLORD",
      landlordVerification: { badgeTier: "PROPERTY_VERIFIED" },
    },
    messages: [
      {
        id: "msg_4_1",
        conversationId: "conv_4",
        senderId: "system",
        type: "SYSTEM",
        content: "Conversation started about Modern 2-Bedroom Apartment in Maitama",
        isRead: true,
        readAt: "2026-05-12T10:00:00.000Z",
        systemEventType: "CONVERSATION_STARTED",
        createdAt: "2026-05-12T10:00:00.000Z",
        sender: { id: "system", firstName: "SafeRent", lastName: null, role: "SYSTEM" },
      },
      {
        id: "msg_4_2",
        conversationId: "conv_4",
        senderId: "mock_tenant_amaka",
        type: "TEXT",
        content: "Hello sir. I'm very interested in the Maitama apartment. I'm a civil servant and I've been looking for a place near the ministry. Is the apartment still available and what documents do I need to bring?",
        isRead: true,
        readAt: "2026-05-12T12:00:00.000Z",
        createdAt: "2026-05-12T10:30:00.000Z",
        sender: { id: "mock_tenant_amaka", firstName: "Amaka", lastName: "Obi", role: "TENANT" },
      },
      {
        id: "msg_4_3",
        conversationId: "conv_4",
        senderId: MOCK_CURRENT_LANDLORD_ID,
        type: "TEXT",
        content: "Good day Amaka. The apartment is available. To proceed, I'll need to verify your identity. Please complete your profile verification on SafeRent. After that, we can schedule a viewing.",
        isRead: true,
        readAt: "2026-05-13T09:00:00.000Z",
        createdAt: "2026-05-12T12:30:00.000Z",
        sender: { id: MOCK_CURRENT_LANDLORD_ID, firstName: "Emeka", lastName: "Obi", role: "LANDLORD" },
      },
      {
        id: "msg_4_4",
        conversationId: "conv_4",
        senderId: "mock_tenant_amaka",
        type: "TEXT",
        content: "I've completed my verification. My BVN and ID are now verified on SafeRent. Can we do the viewing on Saturday?",
        isRead: true,
        readAt: "2026-05-13T13:30:00.000Z",
        createdAt: "2026-05-13T09:15:00.000Z",
        sender: { id: "mock_tenant_amaka", firstName: "Amaka", lastName: "Obi", role: "TENANT" },
      },
      {
        id: "msg_4_5",
        conversationId: "conv_4",
        senderId: MOCK_CURRENT_LANDLORD_ID,
        type: "TEXT",
        content: "Thank you for your interest! I've confirmed your viewing for Saturday 17th May at 2pm. Please arrive on time.",
        isRead: false,
        readAt: null,
        createdAt: "2026-05-13T14:00:00.000Z",
        sender: { id: MOCK_CURRENT_LANDLORD_ID, firstName: "Emeka", lastName: "Obi", role: "LANDLORD" },
      },
    ],
  },

  // Conversation 5: Kelechi (tenant) ↔ Emeka (landlord) — question about service charge
  {
    id: "conv_5",
    listingId: "mock_2",
    tenantId: "mock_tenant_kelechi",
    ownerId: MOCK_CURRENT_LANDLORD_ID,
    lastMessageAt: "2026-05-14T17:45:00.000Z",
    lastMessageText: "Service charge covers estate maintenance, security, and waste management. It's paid quarterly.",
    tenantUnread: 0,
    ownerUnread: 2,
    createdAt: "2026-05-14T15:00:00.000Z",
    updatedAt: "2026-05-14T17:45:00.000Z",
    listing: {
      id: "mock_2",
      title: "Modern 2-Bedroom Apartment in Maitama",
      area: "Maitama",
      address: "Plot 45, Nile Crescent, Maitama",
      photos: [
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" },
      ],
    },
    tenant: {
      id: "mock_tenant_kelechi",
      firstName: "Kelechi",
      lastName: "Eze",
      profilePhoto: null,
      role: "TENANT",
      landlordVerification: null,
    },
    owner: {
      id: MOCK_CURRENT_LANDLORD_ID,
      firstName: "Emeka",
      lastName: "Obi",
      profilePhoto: null,
      role: "LANDLORD",
      landlordVerification: { badgeTier: "PROPERTY_VERIFIED" },
    },
    messages: [
      {
        id: "msg_5_1",
        conversationId: "conv_5",
        senderId: "system",
        type: "SYSTEM",
        content: "Conversation started about Modern 2-Bedroom Apartment in Maitama",
        isRead: true,
        readAt: "2026-05-14T15:00:00.000Z",
        systemEventType: "CONVERSATION_STARTED",
        createdAt: "2026-05-14T15:00:00.000Z",
        sender: { id: "system", firstName: "SafeRent", lastName: null, role: "SYSTEM" },
      },
      {
        id: "msg_5_2",
        conversationId: "conv_5",
        senderId: "mock_tenant_kelechi",
        type: "TEXT",
        content: "Good afternoon. I see the listing has a ₦600,000 service charge. What exactly does this cover? Is it included in the rent or paid separately?",
        isRead: true,
        readAt: "2026-05-14T17:00:00.000Z",
        createdAt: "2026-05-14T15:30:00.000Z",
        sender: { id: "mock_tenant_kelechi", firstName: "Kelechi", lastName: "Eze", role: "TENANT" },
      },
      {
        id: "msg_5_3",
        conversationId: "conv_5",
        senderId: MOCK_CURRENT_LANDLORD_ID,
        type: "TEXT",
        content: "Service charge covers estate maintenance, security, and waste management. It's paid quarterly.",
        isRead: false,
        readAt: null,
        createdAt: "2026-05-14T17:45:00.000Z",
        sender: { id: MOCK_CURRENT_LANDLORD_ID, firstName: "Emeka", lastName: "Obi", role: "LANDLORD" },
      },
    ],
  },
];
