import { Metadata } from "next";
import Image from "next/image";
import { LoginGoogleButton } from "@/components/login-button";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="bg-white w-96 mx-auto rounded-sm shadow p-8 my-8">
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
        <h1 className="text-4xl font-medium mb-1 text-center">Karyawan Yiss</h1>
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
