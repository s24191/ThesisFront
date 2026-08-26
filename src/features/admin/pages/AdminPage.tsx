import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export const AdminPage: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-100">
          Admin panel
        </h1>

        <div className="mb-6 flex gap-3 text-sm">
          <Link
            to="/admin/lookups"
            className={
              "rounded-xl border px-3 py-2 font-medium " +
              (isActive("/admin/lookups")
                ? "border-slate-500 bg-slate-900 text-slate-100"
                : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800")
            }
          >
            Lookups
          </Link>
          <Link
            to="/admin/scraping"
            className={
              "rounded-xl border px-3 py-2 font-medium " +
              (isActive("/admin/scraping")
                ? "border-slate-500 bg-slate-900 text-slate-100"
                : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800")
            }
          >
            Scraping
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 shadow-sm ">
          <div className="p-4 h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};