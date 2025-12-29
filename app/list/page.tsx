"use client";

import { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiFilter, FiCreditCard } from "react-icons/fi";
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

    // Load Snap JS once
    useEffect(() => {
        const scriptId = "midtrans-script";
        if (document.getElementById(scriptId)) return;

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
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
            console.error("Error fetching invoices:", error);
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
                    console.log("Popup closed");
                },
            });
        } catch (err) {
            console.error("Payment error:", err);
        }

        setLoadingId(null);
    };

    // derived state for checks
    const filteredInvoices = useMemo(() => {
        if (activeTab === "all") return invoices;

        return invoices.filter((inv) => {
            const status = inv.status.toUpperCase();
            if (activeTab === "unpaid") return status === "UNPAID";
            if (activeTab === "pending") return status === "PENDING";
            if (activeTab === "succeed") return ["PAID", "SETTLED"].includes(status);
            if (activeTab === "failed") return ["FAILED", "EXPIRED", "CANCELLED"].includes(status);
            return false;
        });
    }, [invoices, activeTab]);

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
                                            <p><span className="font-medium text-gray-700">Siswa:</span> {inv.student.fullname} ({inv.student.unit})</p>
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
                                        ) : "Bayar Sekarang"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
