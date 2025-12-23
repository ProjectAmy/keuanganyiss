"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import { useState, useEffect } from "react";
import clsx from "clsx";

const Navlink = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);
    return (
        <>
            <button onClick={() => setOpen(!open)} className='inline-flex items-center p-2 justify-center text-gray-500 rounded-md md:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'>
                {!open ? <IoMenu className="size-8" /> : <IoClose className="size-8" />}
            </button>
            <div className={clsx("w-full md:block md:w-auto", { "hidden": !open })}>
                <ul className="flex flex-col text-sm upparcase p-4 mt-4 rounded-sm bg-gray-50 dark:bg-zinc-900 md:flex-row md:items-center md:space-x-10 md:p-0 md:mt-0 md:border-0 md:bg-white dark:md:bg-transparent">
                    <li>
                        <Link href="/dashboard" className="block py-2 px-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-sm md:hover:bg-transparent dark:md:hover:bg-transparent md:p-0 md:dark:hover:text-white transition-colors">
                            Invoices
                        </Link>
                    </li>
                    <li>
                        <Link href="/create" className="block py-2 px-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-sm md:hover:bg-transparent dark:md:hover:bg-transparent md:p-0 md:dark:hover:text-white transition-colors">
                            Create
                        </Link>
                    </li>
                    <li>
                        <Link href="/bulk" className="block py-2 px-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-sm md:hover:bg-transparent dark:md:hover:bg-transparent md:p-0 md:dark:hover:text-white transition-colors">
                            Bulk
                        </Link>
                    </li>
                    <li>
                        <Link href="/list" className="block py-2 px-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-sm md:hover:bg-transparent dark:md:hover:bg-transparent md:p-0 md:dark:hover:text-white transition-colors">
                            List
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default Navlink
