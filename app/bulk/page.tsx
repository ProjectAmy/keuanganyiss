"use client";

import React, { useState } from 'react';
import { API_BASE_URL } from "@/lib/constants";
import { IoPeople } from "react-icons/io5";

export default function BulkInvoicesPage() {
    const [formData, setFormData] = useState({
        amount: '',
        description: ''
    });

    const [status, setStatus] = useState<{
        loading: boolean;
        error: string | null;
        success: string | null;
    }>({
        loading: false,
        error: null,
        success: null
    });

    const formatAmount = (value: string) => {
        // Remove non-digit characters
        const number = value.replace(/\D/g, '');
        // Format with dots
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = formatAmount(rawValue);

        setFormData(prev => ({
            ...prev,
            amount: formattedValue
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus({ loading: true, error: null, success: null });

        try {
            const token = localStorage.getItem("auth_token");
            const cleanAmount = formData.amount.replace(/\./g, '');

            const response = await fetch(`${API_BASE_URL}/invoices/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(cleanAmount),
                    description: formData.description
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error: ${response.statusText}`);
            }

            setStatus({ loading: false, error: null, success: 'Bulk invoices created successfully for all students!' });
            setFormData({ amount: '', description: '' });
        } catch (err: any) {
            setStatus({ loading: false, error: err.message || 'Failed to create bulk invoices', success: null });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <IoPeople className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bulk Invoice Creation</h1>
                    </div>
                    <p className="text-gray-600">Create identical invoices for ALL active students in one go.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {status.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {status.success}
                        </div>
                    )}

                    {status.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {status.error}
                        </div>
                    )}

                    <div className="mb-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-1">Attention Required</h3>
                        <p className="text-sm text-yellow-700">
                            This action will generate a new invoice record for <strong>every student</strong> currently registered in the system.
                            Please double-check the amount and description before proceeding.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                                <input
                                    type="text"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleAmountChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none hover:border-blue-200"
                                    placeholder="e.g. 175.000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none hover:border-blue-200 resize-none"
                                placeholder="e.g. SPP Bulan Januari 2025"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status.loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {status.loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Invoices...
                                    </>
                                ) : (
                                    'Create Invoice for All Students'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
