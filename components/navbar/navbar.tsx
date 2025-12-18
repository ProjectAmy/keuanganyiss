import { signOut } from "@/auth";
import Navlink from "./navlink";
import { Session } from "next-auth";

const Navbar = ({ session }: { session: Session }) => {
  return (
    <>
      {/* Navigation Links */}
      <Navlink />

      {/* User Profile and Sign Out */}
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-zinc-700">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-700 shadow-sm"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-none">
              {session?.user?.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Karyawan</span>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </>
  );
};

export default Navbar;
