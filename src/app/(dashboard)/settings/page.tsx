"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Shield, User, Bell, Globe, Lock, Trash2, Monitor, ToggleLeft, ToggleRight, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SUPPORTED_CURRENCIES, CURRENCY_FLAGS, type Currency } from "@/lib/currency";

type Section = "account" | "notifications" | "currency" | "privacy" | "security";

const NOTIFICATION_EVENTS = [
  { key: "viewing_confirmed", label: "Viewing confirmed", category: "Viewings" },
  { key: "viewing_reminder", label: "Viewing reminder (24h before)", category: "Viewings" },
  { key: "escrow_funded", label: "Escrow funded", category: "Payments" },
  { key: "payout_sent", label: "Payout sent", category: "Payments" },
  { key: "rent_due", label: "Rent due reminder", category: "Payments" },
  { key: "dispute_raised", label: "Dispute raised", category: "Disputes" },
  { key: "dispute_resolved", label: "Dispute resolved", category: "Disputes" },
  { key: "lease_renewal_reminder", label: "Lease renewal reminder", category: "Lease" },
  { key: "new_listing_match", label: "New listing matches your search", category: "Listings" },
  { key: "maintenance_update", label: "Maintenance request update", category: "Maintenance" },
  { key: "new_applicant", label: "New applicant for your listing", category: "Listings" },
];

const MOCK_SESSIONS = [
  { id: "s1", device: "MacBook Pro", browser: "Chrome 124", location: "Lagos, Nigeria", lastActive: "Now", current: true },
  { id: "s2", device: "iPhone 15", browser: "Safari Mobile", location: "Lagos, Nigeria", lastActive: "2 hours ago", current: false },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [section, setSection] = useState<Section>("account");
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Account form
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState(session?.user?.phone ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Currency
  const [currency, setCurrency] = useState<Currency>("NGN");

  // Notifications
  const [notifEmail, setNotifEmail] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_EVENTS.map((e) => [e.key, true]))
  );
  const [notifSms, setNotifSms] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_EVENTS.map((e) => [e.key, false]))
  );

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: "account" as Section, label: "Account", icon: User },
    { id: "notifications" as Section, label: "Notifications", icon: Bell },
    { id: "currency" as Section, label: "Currency", icon: Globe },
    { id: "privacy" as Section, label: "Privacy", icon: Trash2 },
    { id: "security" as Section, label: "Security", icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  section === s.id ? "bg-[#0F7B5A]/10 text-[#0F7B5A] font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {saved && (
            <div className="mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              Settings saved successfully
            </div>
          )}

          {/* Account */}
          {section === "account" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0F7B5A]" /> Account Details
              </h2>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <div>
                  <Input
                    label="Phone number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                  <p className="text-xs text-gray-400 mt-1">Changing phone requires OTP verification.</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
                  <div className="space-y-3">
                    <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
                    <Input label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">Save Changes</Button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {section === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0F7B5A]" /> Notification Preferences
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                      <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-20">Email</th>
                      <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-20">SMS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NOTIFICATION_EVENTS.map((event, i) => {
                      const showCat = i === 0 || NOTIFICATION_EVENTS[i - 1].category !== event.category;
                      return [
                        showCat && (
                          <tr key={`cat-${event.category}`} className="border-t border-gray-50">
                            <td colSpan={3} className="pt-4 pb-1">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{event.category}</span>
                            </td>
                          </tr>
                        ),
                        <tr key={event.key} className="hover:bg-gray-50/50">
                          <td className="py-2 pr-4 text-gray-700">{event.label}</td>
                          <td className="py-2 text-center">
                            <button onClick={() => setNotifEmail({ ...notifEmail, [event.key]: !notifEmail[event.key] })}>
                              {notifEmail[event.key]
                                ? <ToggleRight className="w-5 h-5 text-[#0F7B5A] mx-auto" />
                                : <ToggleLeft className="w-5 h-5 text-gray-300 mx-auto" />
                              }
                            </button>
                          </td>
                          <td className="py-2 text-center">
                            <button onClick={() => setNotifSms({ ...notifSms, [event.key]: !notifSms[event.key] })}>
                              {notifSms[event.key]
                                ? <ToggleRight className="w-5 h-5 text-[#0F7B5A] mx-auto" />
                                : <ToggleLeft className="w-5 h-5 text-gray-300 mx-auto" />
                              }
                            </button>
                          </td>
                        </tr>,
                      ];
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </div>
          )}

          {/* Currency */}
          {section === "currency" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0F7B5A]" /> Currency Preference
              </h2>
              <p className="text-sm text-gray-500 mb-5">Select how prices are displayed to you. All payments are processed in NGN at the current exchange rate.</p>
              <div className="space-y-2 max-w-xs">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <label
                    key={c}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${currency === c ? "border-[#0F7B5A] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <input type="radio" name="currency" value={c} checked={currency === c} onChange={() => setCurrency(c)} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${currency === c ? "border-[#0F7B5A]" : "border-gray-300"}`}>
                      {currency === c && <div className="w-2 h-2 rounded-full bg-[#0F7B5A]" />}
                    </div>
                    <span className="text-lg">{CURRENCY_FLAGS[c]}</span>
                    <span className="text-sm font-medium text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
              <div className="mt-5">
                <Button onClick={handleSave}>Save Currency</Button>
              </div>
            </div>
          )}

          {/* Privacy */}
          {section === "privacy" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#0F7B5A]" /> Privacy
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">Download my data</h3>
                  <p className="text-xs text-gray-500 mb-3">Export all your SafeRent data including profile, transactions, and messages.</p>
                  <Button variant="outline" onClick={() => alert("Data export request submitted. You'll receive an email within 24 hours.")}>
                    Request Data Export
                  </Button>
                </div>
                <div className="border border-red-100 rounded-xl p-4 bg-red-50/30">
                  <h3 className="font-semibold text-red-700 text-sm mb-1">Delete Account</h3>
                  <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                    Delete My Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {section === "security" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0F7B5A]" /> Security
              </h2>
              <div className="space-y-5">
                {/* 2FA */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Two-factor authentication</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">Coming soon</span>
                  </div>
                </div>

                {/* Active sessions */}
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-gray-400" /> Active Sessions
                  </h3>
                  <div className="space-y-2">
                    {MOCK_SESSIONS.map((s) => (
                      <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${s.current ? "border-[#0F7B5A]/30 bg-green-50/30" : "border-gray-100"}`}>
                        <div className="flex items-center gap-3">
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700">{s.device} · {s.browser}</p>
                            <p className="text-xs text-gray-400">{s.location} · {s.lastActive}</p>
                          </div>
                        </div>
                        {s.current ? (
                          <span className="text-xs text-[#0F7B5A] font-medium bg-green-100 px-2 py-0.5 rounded-full">Current</span>
                        ) : (
                          <button className="text-xs text-red-600 hover:underline font-medium">Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-red-700">Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete your account and all your data including transactions, messages, and documents. <strong>This cannot be undone.</strong>
            </p>
            <p className="text-sm text-gray-600 mb-5">Type <strong>DELETE</strong> to confirm:</p>
            <input type="text" placeholder="Type DELETE" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1">Delete Account</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
