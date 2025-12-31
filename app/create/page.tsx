"use client";

import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from "@/lib/constants";
import { IoSearchOutline, IoChevronDown, IoCloseCircle } from "react-icons/io5";

interface Student {
    id: number;
    fullname: string;
}

export default function InvoicesPage() {
    const [formData, setFormData] = useState({
        student_id: '',
        amount: '',
        description: ''
    });

    // Autocomplete states
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [status, setStatus] = useState<{
        loading: boolean;
        error: string | null;
        success: string | null;
    }>({
        loading: false,
        error: null,
        success: null
    });

    // Fetch students on mount
    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoadingStudents(true);
            try {
                const token = localStorage.getItem("auth_token");
                const response = await fetch(`${API_BASE_URL}/students`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStudents(data.data || data); // Handle both wrapped and direct array responses
                } else {

                }
            } catch (error) {

            } finally {
                setIsLoadingStudents(false);
            }
        };

        fetchStudents();
    }, []);

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStudentSelect = (student: Student) => {
        setFormData(prev => ({ ...prev, student_id: student.id.toString() }));
        setSearchQuery(student.fullname);
        setIsDropdownOpen(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsDropdownOpen(true);
        // Clear student_id if user types something new (forcing them to select)
        if (formData.student_id) {
            setFormData(prev => ({ ...prev, student_id: '' }));
        }
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.student_id) {
            setStatus({ loading: false, error: 'Please select a valid student from the list', success: null });
            return;
        }

        setStatus({ loading: true, error: null, success: null });

        try {
            const token = localStorage.getItem("auth_token");

            // Remove dots for API submission
            const cleanAmount = formData.amount.replace(/\./g, '');

            const response = await fetch(`${API_BASE_URL}/invoices/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    student_id: Number(formData.student_id),
                    amount: Number(cleanAmount),
                    description: formData.description
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error: ${response.statusText}`);
            }

            setStatus({ loading: false, error: null, success: 'Invoice created successfully!' });
            setFormData({ student_id: '', amount: '', description: '' });
            setSearchQuery('');
        } catch (err: any) {
            setStatus({ loading: false, error: err.message || 'Failed to create invoice', success: null });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Invoice</h1>
                    <p className="mt-2 text-gray-600">Enter the details below to generate a new invoice.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {status.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {status.success}
                        </div>
                    )}

                    {status.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {status.error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Autocomplete Student Field */}
                            <div className="space-y-2 relative" ref={dropdownRef}>
                                <label htmlFor="student_search" className="block text-sm font-medium text-gray-700">
                                    Student Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="student_search"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none hover:border-blue-200"
                                        placeholder="Type name to search..."
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        {isLoadingStudents ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                                        ) : searchQuery ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setFormData(prev => ({ ...prev, student_id: '' }));
                                                    setIsDropdownOpen(true);
                                                }}
                                                className="hover:text-gray-600"
                                            >
                                                <IoCloseCircle className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <IoSearchOutline className="w-5 h-5" />
                                        )}
                                    </div>
                                </div>

                                {/* Hidden Input for actual ID */}
                                <input
                                    type="hidden"
                                    name="student_id"
                                    value={formData.student_id}
                                    required
                                />

                                {/* Dropdown List */}
                                {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                        {filteredStudents.length > 0 ? (
                                            <ul className="py-1">
                                                {filteredStudents.map((student) => (
                                                    <li
                                                        key={student.id}
                                                        onClick={() => handleStudentSelect(student)}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors duration-150 flex items-center justify-between group"
                                                    >
                                                        <span className="font-medium">{student.fullname}</span>
                                                        {formData.student_id === student.id.toString() && (
                                                            <span className="text-blue-600 text-sm font-semibold">Selected</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-3 text-gray-500 text-center text-sm">
                                                {isLoadingStudents ? 'Loading...' : 'No students found'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

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
                                placeholder="e.g. SPP Bulan Desember"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status.loading || !formData.student_id}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {status.loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Invoice...
                                    </>
                                ) : (
                                    'Create Invoice'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

