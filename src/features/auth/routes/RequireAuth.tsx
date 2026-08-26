import type {ReactNode,} from "react";
import {Navigate, useLocation,} from "react-router-dom";
import {useAuthStore,} from "@/features/auth/store/authStore";


type RequireAuthProps = { children: ReactNode; };

export const RequireAuth = ({
  children,
}: RequireAuthProps) => {
  const token = useAuthStore(
    (state) => state.token,
  );

  const authChecked = useAuthStore(
    (state) => state.authChecked,
  );

  const location = useLocation();

  if (!token) {
    const redirect = [
      location.pathname,
      location.search,
      location.hash,
    ].join("");

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          redirect,
        )}`}
        replace
      />
    );
  }

  if (!authChecked) {
    return (
      <main className="grid min-h-[calc(100vh-65px)] place-items-center bg-slate-950 px-4 text-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-teal-300"
          />

          Checking your account…
        </div>
      </main>
    );
  }

  return <>{children}</>;
};