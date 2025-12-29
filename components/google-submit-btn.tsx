"use client"

import { useFormStatus } from "react-dom"
import { FaG } from "react-icons/fa6"
import { useEffect, useState } from "react"

export function GoogleSubmitBtn() {
    const { pending } = useFormStatus()
    const [dots, setDots] = useState("")

    useEffect(() => {
        if (pending) {
            const interval = setInterval(() => {
                setDots((prev) => (prev.length >= 5 ? "" : prev + "."))
            }, 500)
            return () => clearInterval(interval)
        } else {
            setDots("")
        }
    }, [pending])

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white font-medium py-3 px-6 text-base rounded-md hover:bg-blue-600 cursor-pointer disabled:bg-blue-400 disabled:cursor-wait"
        >
            {pending ? (
                <span className="min-w-[140px] text-left">
                    Sedang login{dots}
                </span>
            ) : (
                <>
                    <FaG className="size-6" />
                    Login dengan Google
                </>
            )}
        </button>
    )
}
