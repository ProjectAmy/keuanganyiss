"use client";

import { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiFilter, FiCreditCard, FiSearch } from "react-icons/fi";
import { clsx } from "clsx";

declare global {
    interface Window {
        snap: any;
    }
}

interface Invoice {
    id: number;
    description: string;
    amount: number;
    status: string;
    created_at?: string; // Assuming API might return this, optional for now
    due_date?: string;   // Assuming API might return this
    student?: {
        fullname: string;
        unit: string;
        grade: string;
        walimurid_profile?: {
            fullname: string;
            phone: string;
        }
    }
}

type TabType = "all" | "unpaid" | "pending" | "succeed" | "failed";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("unpaid");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [invoiceToMark, setInvoiceToMark] = useState<Invoice | null>(null);

    // Load Snap JS once
    useEffect(() => {
        const scriptId = "midtrans-script";
        if (document.getElementById(scriptId)) return;

        const script = document.createElement("script");
        script.id = scriptId;
        const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
        script.src = isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const getToken = () => {
        // Try getting from cookie first, then localStorage
        // Note: We need to import Cookies dynamically or use native document.cookie if we want to avoid top-level import issues if SSR, 
        // but since this is "use client", we can just assume document.cookie or localStorage availability.
        // Simple parse for cookie or use localStorage
        return localStorage.getItem("auth_token");
        // Or if you want to use the cookie you just set:
        // const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
        // return match ? match[2] : localStorage.getItem("auth_token");
    };

    const fetchInvoices = async () => {
        try {
            const token = getToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/invoices/list`, {
                headers: headers
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setInvoices(data);
            } else if (data && Array.isArray(data.data)) {
                setInvoices(data.data);
            } else {
                setInvoices([]);
            }
        } catch (error) {

            setInvoices([]);
        }
        setLoading(false);
    };

    const handlePay = async (invoiceId: number) => {
        setLoadingId(invoiceId);

        try {
            const token = getToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/snap-token`, {
                method: "POST",
                headers: headers,
            });

            const data = await res.json();
            const snapToken = data.snap_token;

            if (!snapToken) {
                alert("Gagal mendapatkan token pembayaran");
                setLoadingId(null);
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: function () {
                    // alert("Pembayaran berhasil!"); // Optional: replace with toast if available
                    fetchInvoices();
                },
                onPending: function () {
                    // alert("Menunggu pembayaran...");
                    fetchInvoices();
                },
                onError: function () {
                    alert("Pembayaran gagal");
                },
                onClose: function () {

                },
            });
        } catch (err) {

        }

        setLoadingId(null);
    };

    const initiateMarkAsPaidCash = (invoice: Invoice) => {
        setInvoiceToMark(invoice);
        setShowConfirmModal(true);
    };

    const handleConfirmMarkAsPaidCash = async () => {
        if (!invoiceToMark) return;

        const invoiceId = invoiceToMark.id;
        setShowConfirmModal(false);
        setLoadingId(invoiceId);

        try {
            const token = getToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/mark-paid-cash`, {
                method: "POST",
                headers: headers,
            });

            if (res.ok) {
                // Better UX: fetch invoices first then clear modal data if needed
                // But since status is shared, it's fine
                fetchInvoices();
            } else {
                const data = await res.json();
                alert(data.message || "Gagal menandai tagihan");
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi");
        }

        setLoadingId(null);
        setInvoiceToMark(null);
    };

    // derived state for checks
    const filteredInvoices = useMemo(() => {
        let filtered = invoices;

        // First filter by tab
        if (activeTab !== "all") {
            filtered = filtered.filter((inv) => {
                const status = inv.status.toUpperCase();
                if (activeTab === "unpaid") return status === "UNPAID";
                if (activeTab === "pending") return status === "PENDING";
                if (activeTab === "succeed") return ["PAID", "SETTLED"].includes(status);
                if (activeTab === "failed") return ["FAILED", "EXPIRED", "CANCELLED"].includes(status);
                return false;
            });
        }

        // Then filter by search query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter((inv) =>
                inv.description.toLowerCase().includes(lowerQuery) ||
                inv.student?.fullname.toLowerCase().includes(lowerQuery) ||
                inv.student?.walimurid_profile?.fullname.toLowerCase().includes(lowerQuery)
            );
        }

        return filtered;
    }, [invoices, activeTab, searchQuery]);

    const stats = useMemo(() => {
        const pendingTotal = invoices
            .filter(i => i.status === "PENDING" || i.status === "UNPAID")
            .reduce((acc, curr) => acc + curr.amount, 0);

        const paidTotal = invoices
            .filter(i => ["PAID", "SETTLED"].includes(i.status))
            .reduce((acc, curr) => acc + curr.amount, 0);

        return { pendingTotal, paidTotal };
    }, [invoices]);

    const tabs: { id: TabType; label: string; count: number }[] = [
        { id: "unpaid", label: "Belum Bayar", count: invoices.filter(i => i.status === "UNPAID").length },
        { id: "pending", label: "Menunggu", count: invoices.filter(i => i.status === "PENDING").length },
        { id: "succeed", label: "Berhasil", count: invoices.filter(i => ["PAID", "SETTLED"].includes(i.status)).length },
        { id: "failed", label: "Gagal", count: invoices.filter(i => ["FAILED", "EXPIRED", "CANCELLED"].includes(i.status)).length },
        { id: "all", label: "Semua", count: invoices.length },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tagihan Sekolah</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola dan bayar tagihan sekolah dengan mudah.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Belum Dibayar</p>
                        <p className="text-2xl font-bold text-gray-900">Rp {stats.pendingTotal.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <FiCreditCard className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Terbayar</p>
                        <p className="text-2xl font-bold text-gray-900 text-green-600">Rp {stats.paidTotal.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <FiCheckCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Cari tagihan, nama siswa, atau wali..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                activeTab === tab.id
                                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700",
                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors"
                            )}
                        >
                            {tab.label}
                            <span className={clsx(
                                "py-0.5 px-2.5 rounded-full text-xs font-medium",
                                activeTab === tab.id ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300" : "bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-gray-300"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                {filteredInvoices.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center bg-gray-50 rounded-full mb-4">
                            <FiFilter className="w-6 h-6" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada tagihan</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Tidak ada tagihan ditemukan untuk filter status ini.
                        </p>
                    </div>
                ) : (
                    filteredInvoices.map((inv) => (
                        <div
                            key={inv.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className={clsx(
                                    "p-3 rounded-xl flex-shrink-0",
                                    inv.status === "PAID" || inv.status === "SETTLED" ? "bg-green-50 text-green-600" :
                                        inv.status === "PENDING" ? "bg-yellow-50 text-yellow-600" :
                                            inv.status === "UNPAID" ? "bg-blue-50 text-blue-600" :
                                                "bg-red-50 text-red-600"
                                )}>
                                    {inv.status === "PAID" || inv.status === "SETTLED" ? <FiCheckCircle className="w-6 h-6" /> :
                                        inv.status === "PENDING" ? <FiClock className="w-6 h-6" /> :
                                            inv.status === "UNPAID" ? <FiCreditCard className="w-6 h-6" /> :
                                                <FiAlertCircle className="w-6 h-6" />
                                    }
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{inv.description}</h3>
                                    <p className="text-2xl font-bold mt-1 text-gray-900">Rp {inv.amount.toLocaleString()}</p>

                                    {inv.student && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p><span className="font-medium text-gray-700">Siswa:</span> {inv.student.fullname} ( {inv.student.grade} {inv.student.unit} )</p>
                                            {inv.student.walimurid_profile && (
                                                <p><span className="font-medium text-gray-700">Ortu:</span> {inv.student.walimurid_profile.fullname}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide",
                                    inv.status === "PAID" || inv.status === "SETTLED" ? "bg-green-100 text-green-800" :
                                        inv.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                            inv.status === "UNPAID" ? "bg-blue-100 text-blue-800" :
                                                "bg-red-100 text-red-800"
                                )}>
                                    {inv.status}
                                </span>

                                {inv.status !== "PAID" && inv.status !== "SETTLED" && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <button
                                            onClick={() => handlePay(inv.id)}
                                            disabled={loadingId === inv.id}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loadingId === inv.id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Memproses
                                                </>
                                            ) : "Bayar Online"}
                                        </button>
                                        <button
                                            onClick={() => initiateMarkAsPaidCash(inv)}
                                            disabled={loadingId === inv.id}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-emerald-600 text-sm font-medium rounded-lg text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Bayar Cash
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Backdrop with Fade In */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                        onClick={() => setShowConfirmModal(false)}
                    />

                    {/* Modal content with Scale/Fade In */}
                    <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 pb-0 flex flex-col items-center text-center">
                            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                                <FiCheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Pembayaran Cash</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Apakah Anda yakin ingin menandai tagihan ini sebagai <strong>LUNAS</strong> secara tunai / cash?
                            </p>
                        </div>

                        {/* Invoice Info */}
                        <div className="m-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Deskripsi</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{invoiceToMark?.description}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Rp {invoiceToMark?.amount.toLocaleString()}</span>
                            </div>
                            <div className="mt-2 text-xs text-center text-gray-500 italic">
                                Siswa: {invoiceToMark?.student?.fullname}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 dark:bg-zinc-800/30 flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmMarkAsPaidCash}
                                className="flex-[1.5] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                            >
                                Konfirmasi Bayar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
