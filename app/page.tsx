import { Metadata } from "next";
import Image from "next/image";
import { LoginGoogleButton } from "@/components/login-button";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (session?.user?.roles?.some((role: string) => role.toLowerCase() === "staff keuangan")) {
    redirect("/dashboard");
  }

  // If logged in but not staff, we want to show the specific error
  // But strictly speaking, the user said "lempar ke halaman awal".
  // If they are here, they are at the home page.
  // We can treat them as if they need to see the error.


  const { error } = await searchParams;

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="bg-white w-96 mx-auto rounded-sm shadow p-8 my-8 relative">
        {(error === "AccessDenied" || !!session) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">
            <strong className="font-bold">Akses Ditolak!</strong>
            <span className="block sm:inline"> Email anda tidak terdaftar sebagai staff.</span>
          </div>
        )}
        <div className="flex justify-center mb-4">
          <Image
            src="/LogoYiss.png"
            alt="Logo YISS"
            width={200}
            height={200}
            className="w-auto h-auto"
            priority
          />
        </div>
        <h1 className="text-4xl font-medium mb-1 text-center">Staf Keuangan</h1>
        <p className="font-medium mb-5 text-gray-500 text-center">
          Silahkan login ke akun anda
        </p>
        <div className="py-4 text-center">
          <LoginGoogleButton />
        </div>
      </div>
    </div>
  );
}
