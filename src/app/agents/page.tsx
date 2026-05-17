import Link from "next/link";
import { Shield, Star, Search, MapPin, CheckCircle } from "lucide-react";

const MOCK_AGENTS = [
  {
    id: "agent1",
    firstName: "Babatunde",
    lastName: "Adeyemi",
    businessName: "Adeyemi Properties",
    bio: "Lagos-based property agent specialising in Lekki, Ikeja, and Victoria Island. LASRERA certified. 8 years experience.",
    areas: ["Lekki", "Ikeja", "Victoria Island"],
    propertyTypes: ["Flat", "Duplex"],
    listings: 24,
    completedLets: 31,
    responseRate: 95,
    avgDaysToLet: 11,
    isPro: true,
    cacVerified: true,
    lasreraVerified: true,
    initials: "BA",
  },
  {
    id: "agent2",
    firstName: "Ngozi",
    lastName: "Okafor",
    businessName: "Okafor Realty",
    bio: "Abuja-based agent covering Maitama, Wuse, and Garki. Specialist in executive apartments and corporate lets.",
    areas: ["Maitama", "Wuse 2", "Garki"],
    propertyTypes: ["Flat", "Terraced House"],
    listings: 15,
    completedLets: 19,
    responseRate: 88,
    avgDaysToLet: 15,
    isPro: false,
    cacVerified: true,
    lasreraVerified: false,
    initials: "NO",
  },
  {
    id: "agent3",
    firstName: "Emeka",
    lastName: "Eze",
    businessName: "EzeHomes Nigeria",
    bio: "Multi-city agent with operations in Lagos and Port Harcourt. Expert in affordable housing and first-time renters.",
    areas: ["Surulere", "Yaba", "GRA Port Harcourt"],
    propertyTypes: ["Self-contained", "Flat", "Room & Parlour"],
    listings: 18,
    completedLets: 22,
    responseRate: 91,
    avgDaysToLet: 8,
    isPro: true,
    cacVerified: true,
    lasreraVerified: true,
    initials: "EE",
  },
  {
    id: "agent4",
    firstName: "Fatima",
    lastName: "Hassan",
    businessName: "Hassan & Co Properties",
    bio: "Licensed real estate consultant in Kano and Kaduna. Focus on family-friendly estates.",
    areas: ["Kano GRA", "Nassarawa Kano", "Kaduna"],
    propertyTypes: ["Bungalow", "Flat", "Duplex"],
    listings: 9,
    completedLets: 7,
    responseRate: 80,
    avgDaysToLet: 18,
    isPro: false,
    cacVerified: false,
    lasreraVerified: false,
    initials: "FH",
  },
];

export default function AgentsDirectoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRent</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0F7B5A]">Sign In</Link>
            <Link href="/register" className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049]">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verified Agent Directory</h1>
          <p className="text-gray-500">Find CAC and LASRERA-verified rental agents across Nigeria</p>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents, areas..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] bg-white"
            />
          </div>
          <select className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] bg-white">
            <option>All Areas</option>
            <option>Lagos</option>
            <option>Abuja</option>
            <option>Port Harcourt</option>
            <option>Kano</option>
          </select>
          <select className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] bg-white">
            <option>All Specialisations</option>
            <option>Flat</option>
            <option>Duplex</option>
            <option>Self-contained</option>
          </select>
        </div>

        {/* Agent cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {MOCK_AGENTS.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/20 transition-all p-5 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#0F7B5A]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-[#0F7B5A] font-bold text-lg">{agent.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#0F7B5A] transition-colors">
                      {agent.firstName} {agent.lastName}
                    </h3>
                    {agent.isPro && (
                      <span className="flex items-center gap-0.5 text-xs bg-[#D4A017] text-white font-semibold px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-white" /> Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{agent.businessName}</p>

                  {/* Verification badges */}
                  <div className="flex gap-1.5 mb-3">
                    {agent.cacVerified && (
                      <span className="inline-flex items-center gap-0.5 text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> CAC
                      </span>
                    )}
                    {agent.lasreraVerified && (
                      <span className="inline-flex items-center gap-0.5 text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> LASRERA
                      </span>
                    )}
                  </div>

                  {/* Areas */}
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {agent.areas.slice(0, 2).map((area) => (
                      <span key={area} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{area}</span>
                    ))}
                    {agent.areas.length > 2 && (
                      <span className="text-xs text-gray-400">+{agent.areas.length - 2} more</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { val: agent.listings, label: "Listings" },
                      { val: `${agent.completedLets}`, label: "Lets" },
                      { val: `${agent.responseRate}%`, label: "Response" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 rounded-lg py-1.5">
                        <p className="text-sm font-bold text-gray-800">{stat.val}</p>
                        <p className="text-xs text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-gray-400">Showing {MOCK_AGENTS.length} verified agents</p>
        </div>
      </div>
    </div>
  );
}
