"use client";

import { useRef, useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, Mail, Trash2, Edit2, Loader, Search, Filter, Check, AlertCircle } from "lucide-react";

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
  tags?: string[];
  notes?: string;
  communication_status?: Record<string, { status: string; sent_count: number; last_sent?: string }>;
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
  const [selectedGuests, setSelectedGuests] = useState<Set<number>>(new Set());

  const toggleGuestSelection = (guestId: number) => {
    const newSelected = new Set(selectedGuests);
    newSelected.has(guestId) ? newSelected.delete(guestId) : newSelected.add(guestId);
    setSelectedGuests(newSelected);
  };

  const toggleAllSelection = () => {
    selectedGuests.size === guests.length
      ? setSelectedGuests(new Set())
      : setSelectedGuests(new Set(guests.map(g => g.id)));
  };

  const acceptedCount = guests.filter(g => g.rsvp_status === "accepted").length;
  const declinedCount = guests.filter(g => g.rsvp_status === "declined").length;
  const pendingCount = guests.filter(g => g.rsvp_status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-600 mb-1">Total Guests</p>
          <p className="text-2xl font-bold text-slate-900">{totalGuests}</p>
          {guestLimit && <p className="text-xs text-slate-500 mt-1">of {guestLimit}</p>}
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-4">
          <p className="text-xs font-medium text-emerald-600 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-emerald-900">{acceptedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4">
          <p className="text-xs font-medium text-amber-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
          <p className="text-xs font-medium text-red-600 mb-1">Declined</p>
          <p className="text-2xl font-bold text-red-900">{declinedCount}</p>
        </div>
      </div>

      {/* Add Guest Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Guest
        </h2>
        <form onSubmit={addGuest} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Full Name *</label>
              <input
                placeholder="Guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Phone</label>
              <input
                placeholder="Phone number"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Email</label>
              <input
                placeholder="Email address"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={guestLimit !== null && totalGuests >= guestLimit}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-10 font-medium"
          >
            Add Guest
          </Button>
        </form>
      </div>

      {/* Bulk Import Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Import
        </h2>
        <p className="text-sm text-slate-600 mb-4">Upload CSV with columns: name, phone, email</p>
        <div className="flex gap-2">
          <input
            ref={resolvedFileRef}
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="flex h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:text-white file:font-medium hover:file:bg-slate-800"
          />
          <Button
            onClick={uploadCsv}
            disabled={!csvFile || csvUploading}
            className="h-10 px-4 font-medium bg-slate-900 hover:bg-slate-800 text-white"
          >
            {csvUploading ? <Loader className="w-4 h-4 animate-spin" /> : "Upload"}
          </Button>
        </div>
        {csvResult && <p className="text-sm text-emerald-600 font-medium mt-2">{csvResult}</p>}
      </div>

      {/* Guest Management */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Guest List ({totalGuests})
        </h2>

        {guests.length === 0 ? (
          <div className="bg-slate-50 rounded-lg border border-slate-200 border-dashed p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No guests yet. Add your first guest above.</p>
          </div>
        ) : (
          <>
            {/* Search & Filter */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[250px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <select
                  value={guestRsvpFilter}
                  onChange={(e) => setGuestRsvpFilter(e.target.value)}
                  className="flex h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">All Guests</option>
                  <option value="accepted">✓ Accepted</option>
                  <option value="pending">○ Pending</option>
                  <option value="declined">✗ Declined</option>
                </select>
                {(guestSearch || guestRsvpFilter) && (
                  <Button variant="ghost" size="sm" onClick={resetGuestFilter} className="text-xs h-10">
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedGuests.size > 0 && (
              <div className="bg-slate-900 text-white rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm font-medium">{selectedGuests.size} guest{selectedGuests.size !== 1 ? 's' : ''} selected</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedGuests(new Set())}
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Deselect
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}

            {/* Guest Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedGuests.size === guests.length && guests.length > 0}
                        onChange={toggleAllSelection}
                        className="rounded border-slate-300 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Contact</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">RSVP Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">Message Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                      {editingGuest === guest.id ? (
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <label className="text-xs font-medium text-slate-700 block mb-1.5">Full Name *</label>
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                              />
                              {!editName.trim() && <p className="text-xs text-red-600 mt-1">Name is required</p>}
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
                                    Saving
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
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-slate-900">Delete {guest.name}? This cannot be undone.</p>
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
                        <>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedGuests.has(guest.id)}
                              onChange={() => toggleGuestSelection(guest.id)}
                              className="rounded border-slate-300 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-semibold text-slate-900">{guest.name}</p>
                            {guest.notes && <p className="text-xs text-slate-500 mt-1">{guest.notes}</p>}
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {guest.email && <p className="text-xs text-slate-600">{guest.email}</p>}
                              {guest.phone && <p className="text-xs text-slate-600">{guest.phone}</p>}
                              {!guest.email && !guest.phone && <p className="text-xs text-slate-400">No contact</p>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                              guest.rsvp_status === "accepted"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : guest.rsvp_status === "declined"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}>
                              {guest.rsvp_status === "accepted" && "✓ Accepted"}
                              {guest.rsvp_status === "declined" && "✗ Declined"}
                              {guest.rsvp_status === "pending" && "○ Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap text-xs">
                              {guest.invite_sent && (
                                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                  Sent {guest.invite_attempts || 1}/3
                                </span>
                              )}
                              {guest.invite_viewed_at && (
                                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Viewed
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => sendGuestInvite(guest.id)}
                                title="Send message"
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                              >
                                <Mail className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(guest)}
                                title="Edit"
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                <Edit2 className="w-4 h-4 text-slate-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirm(guest.id)}
                                title="Delete"
                                className="h-8 w-8 p-0 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
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

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-1 pt-4 border-t border-slate-200">
                <button className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30" disabled={currentPage === 0} onClick={() => goToPage(0)}>⌜</button>
                <button className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30" disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)}>‹</button>
                {Array.from({ length: pageCount }, (_, i) => (
                  <button key={i} onClick={() => goToPage(i)} className={`px-3 py-1.5 text-xs rounded border ${i === currentPage ? "bg-slate-900 text-white border-slate-900 font-bold" : "border-slate-200 hover:bg-slate-50"}`}>{i + 1}</button>
                ))}
                <button className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30" disabled={currentPage >= pageCount - 1} onClick={() => goToPage(currentPage + 1)}>›</button>
                <button className="px-2 py-1.5 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30" disabled={currentPage >= pageCount - 1} onClick={() => goToPage(pageCount - 1)}>⌟</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
