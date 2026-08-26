import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import React, { useEffect } from "react";
import {useAuthStore} from "@/features/auth/store/authStore.ts";
import {NavBar} from "@/shared/components/NavBar.tsx";
import {Home} from "@/pages/Home.tsx";
import {WinesPage} from "@/features/wines/pages/WinesPage.tsx";
import {MyCommentsPage} from "@/features/profile/pages/MyCommentsPage.tsx";
import {AdminRoute} from "@/features/admin/routes/AdminRoute.tsx";
import {AdminPage} from "@/features/admin/pages/AdminPage.tsx";
import {AdminLookupsPage} from "@/features/admin/pages/AdminLookupsPage.tsx";
import {AdminScrapingPage} from "@/features/admin/pages/AdminScrapingPage.tsx";
import {LoginPage} from "@/features/auth/pages/LoginPage.tsx";
import {RegisterPage} from "@/features/auth/pages/RegisterPage.tsx";
import {WineDetailsPage} from "@/features/wines/pages/WineDetailsPage.tsx";
import {RequireAuth} from "@/features/auth/routes/RequireAuth.tsx";
import {MyFollowedWinesPage} from "@/features/profile/pages/MyFollowedWinesPage.tsx";


const NotFoundPage = () => (
  <section className="grid min-h-[calc(100vh-65px)] place-items-center bg-slate-950 px-4 text-slate-100">
    <div className="max-w-md text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">
        Error 404
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-50">
        This wine page has gone missing.
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        The address may be incorrect, or the page may no
        longer be available.
      </p>

      <Link to="/" className="mt-6 inline-flex rounded-xl border border-teal-300 bg-teal-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-300">
        Return home
      </Link>
    </div>
  </section>
);

export const AppRoutes: React.FC = () => {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

return (
    <BrowserRouter>
      <div className=" min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <NavBar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/wines" element={<WinesPage />} />
            <Route path="/wines/:id" element={<WineDetailsPage />} />
            <Route path="/me/followed-wines" element={<RequireAuth><MyFollowedWinesPage /></RequireAuth>} />
            <Route path="/me/comments" element={<RequireAuth><MyCommentsPage /></RequireAuth>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}>
              <Route path="lookups" element={<AdminLookupsPage />} />
              <Route path="scraping" element={<AdminScrapingPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />}/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};