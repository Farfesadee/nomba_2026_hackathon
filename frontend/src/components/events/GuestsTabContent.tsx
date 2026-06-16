"use client";

import { useRef, useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, Mail, QrCode, Trash2, Edit2, Loader } from "lucide-react";

type Guest = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  rsvp_status: string;
  rsvp_note?: string | null;
  invite_sent: boolean;
  invite_attempts?: number;
  invite_viewed_at?: string | null;
};

type GuestsTabContentProps = {
  guestLimit: number | null;
  totalGuests: number;
  remainingGuests: number | null;
  guestName: string;
  setGuestName: (v: string) => void;
  guestPhone: string;
  setGuestPhone: (v: string) => void;
  guestEmail: string;
  setGuestEmail: (v: string) => void;
  addGuest: (e: FormEvent) => Promise<void>;
  csvFile: File | null;
  setCsvFile: (f: File | null) => void;
  csvUploading: boolean;
  csvResult: string | null;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  uploadCsv: () => Promise<void>;
  guests: Guest[];
  guestSearch: string;
  setGuestSearch: (v: string) => void;
  guestRsvpFilter: string;
  setGuestRsvpFilter: (v: string) => void;
  handleGuestSearch: (e: FormEvent) => void;
  resetGuestFilter: () => void;
  editingGuest: number | null;
  setEditingGuest: (v: number | null) => void;
  editName: string;
  setEditName: (v: string) => void;
  editPhone: string;
  setEditPhone: (v: string) => void;
  editEmail: string;
  setEditEmail: (v: string) => void;
  saveEdit: (guestId: number) => Promise<void>;
  savingGuest: number | null;
  deleteConfirm: number | null;
  setDeleteConfirm: (v: number | null) => void;
  handleDeleteGuest: (guestId: number) => Promise<void>;
  startEdit: (guest: Guest) => void;
  sendGuestInvite: (guestId: number) => Promise<void>;
  generateQR: (guestId: number) => Promise<void>;
  generatingQR: number | null;
  currentPage: number;
  pageCount: number;
  goToPage: (page: number) => void;
};

export default function GuestsTabContent({
  guestLimit,
  totalGuests,
  remainingGuests,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  guestEmail,
  setGuestEmail,
  addGuest,
  csvFile,
  setCsvFile,
  csvUploading,
  csvResult,
  fileInputRef,
  uploadCsv,
  guests,
  guestSearch,
  setGuestSearch,
  guestRsvpFilter,
  setGuestRsvpFilter,
  handleGuestSearch,
  resetGuestFilter,
  editingGuest,
  setEditingGuest,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  editEmail,
  setEditEmail,
  saveEdit,
  savingGuest,
  deleteConfirm,
  setDeleteConfirm,
  handleDeleteGuest,
  startEdit,
  sendGuestInvite,
  generateQR,
  generatingQR,
  currentPage,
  pageCount,
  goToPage,
}: GuestsTabContentProps) {
  const localFileRef = useRef<HTMLInputElement | null>(null);
  const resolvedFileRef = fileInputRef ?? localFileRef;

  return (
    <div className="space-y-8">
      {/* Add Guest Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Individual Guest
        </h2>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          {guestLimit !== null && (
            <p className="mb-4 text-sm font-medium text-slate-600">
              Capacity: <span className="text-slate-900">{totalGuests} / {guestLimit}</span>
              {remainingGuests !== null && <span className="text-slate-500"> ({remainingGuests} remaining)</span>}
            </p>
          )}
          <form onSubmit={addGuest} className="space-y-3">
            <input
              placeholder="Full Name *"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
            <input
              placeholder="Phone (optional)"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              placeholder="Email (optional)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <Button
              type="submit"
              disabled={guestLimit !== null && totalGuests >= guestLimit}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-10 font-medium"
            >
              Add Guest
            </Button>
          </form>
        </div>
      </div>

      {/* CSV Import Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Import (CSV)
        </h2>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-4">
            Upload a CSV file with columns: <code className="bg-white px-2 py-1 rounded text-xs border border-slate-200">name, phone, email</code>
          </p>
          <div className="flex gap-2 mb-4">
            <input
              ref={resolvedFileRef}
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:text-white file:font-medium hover:file:bg-slate-800 file:cursor-pointer file:transition-colors"
            />
            <Button
              onClick={uploadCsv}
              disabled={!csvFile || csvUploading || (guestLimit !== null && totalGuests >= guestLimit)}
              className="h-10 px-4 font-medium"
            >
              {csvUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-1" />
                  Uploading
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
          {csvResult && <p className="text-sm text-emerald-600 font-medium">{csvResult}</p>}
        </div>
      </div>

      {/* Guest List Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Guest List ({totalGuests})
        </h2>
        {guests.length === 0 ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-12 text-center">
            <p className="text-sm text-slate-600">No guests added yet. Start by adding a guest above or importing a CSV.</p>
          </div>
        ) : (
          <>
            {/* Search & Filter */}
            <div className="mb-6 space-y-2">
              <p className="text-xs text-slate-600">Search by name, phone, or email</p>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-3 flex-wrap">
                <form onSubmit={handleGuestSearch} className="flex gap-2 flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="flex h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </form>
                <select
                  value={guestRsvpFilter}
                  onChange={(e) => setGuestRsvpFilter(e.target.value)}
                  className="flex h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">All Guests</option>
                  <option value="accepted">✓ Accepted</option>
                  <option value="declined">✗ Declined</option>
                  <option value="pending">○ Pending</option>
                </select>
                {(guestSearch || guestRsvpFilter) && (
                  <Button variant="ghost" size="sm" onClick={resetGuestFilter} className="text-xs">
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Guest Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Guest Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Contact</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700">RSVP Status</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700">Invite</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                        {editingGuest === guest.id ? (
                          // Edit mode
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1.5">Full Name *</label>
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Enter guest name"
                                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                                {!editName.trim() && (
                                  <p className="text-xs text-red-600 mt-1">Name is required</p>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Phone</label>
                                  <input
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    placeholder={guest.phone || "Enter phone"}
                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Email</label>
                                  <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder={guest.email || "Enter email"}
                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2 border-t border-slate-200">
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(guest.id)}
                                  disabled={!editName.trim() || savingGuest === guest.id}
                                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
                                >
                                  {savingGuest === guest.id ? (
                                    <>
                                      <Loader className="w-3 h-3 animate-spin mr-1" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingGuest(null)}
                                  disabled={savingGuest === guest.id}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </td>
                        ) : deleteConfirm === guest.id ? (
                          // Delete confirmation
                          <td colSpan={5} className="px-6 py-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-sm font-medium text-slate-900">Delete {guest.name}?</p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteGuest(guest.id)}>
                                  Delete
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          // Display mode
                          <>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-900">{guest.name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {guest.email && <p className="text-xs text-slate-600">{guest.email}</p>}
                                {guest.phone && <p className="text-xs text-slate-600">{guest.phone}</p>}
                                {!guest.email && !guest.phone && <p className="text-xs text-slate-400">No contact</p>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  guest.rsvp_status === "accepted"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : guest.rsvp_status === "declined"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {guest.rsvp_status === "accepted" && "✓"}
                                {guest.rsvp_status === "declined" && "✗"}
                                {guest.rsvp_status === "pending" && "○"}
                                {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                {guest.invite_sent && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                    Sent
                                  </span>
                                )}
                                {guest.invite_attempts && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                                    Attempt {guest.invite_attempts}/3
                                  </span>
                                )}
                                {guest.invite_viewed_at && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                    Viewed
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sendGuestInvite(guest.id)}
                                  title="Send invite"
                                  className="h-8 w-8 p-0"
                                >
                                  <Mail className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => generateQR(guest.id)}
                                  disabled={generatingQR === guest.id}
                                  title="Generate QR"
                                  className="h-8 w-8 p-0"
                                >
                                  {generatingQR === guest.id ? (
                                    <Loader className="w-4 h-4 animate-spin text-amber-600" />
                                  ) : (
                                    <QrCode className="w-4 h-4 text-amber-600" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEdit(guest)}
                                  title="Edit"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-4 h-4 text-slate-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteConfirm(guest.id)}
                                  title="Delete"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-slate-200">
                <button
                  className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  disabled={currentPage === 0}
                  onClick={() => goToPage(0)}
                >
                  ⌜
                </button>
                <button
                  className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  disabled={currentPage === 0}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  ‹
                </button>
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      i === currentPage
                        ? "bg-slate-900 text-white border-slate-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => goToPage(pageCount - 1)}
                >
                  ⌟
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
