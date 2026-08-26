import type {ReactNode,} from "react";
import {
  LogIn,
  LogOut,
  MessageSquareText,
  Settings,
  UserPlus,
  Wine,
} from "lucide-react";

import {Link, useNavigate,} from "react-router-dom";
import {useAuthStore} from "@/features/auth/store/authStore.ts";

type Props = {
  onClose: () => void;
};

type MenuLinkProps = {
  to: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

const MenuLink = ({
  to,
  label,
  icon,
  onClick,
}: MenuLinkProps) => (
  <Link
    to={to}
    role="menuitem"
    onClick={onClick}
    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400/70"
  >
    <span className="grid h-7 w-7 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition group-hover:border-teal-400/40 group-hover:bg-teal-400/10 group-hover:text-teal-200">
      {icon}
    </span>

    <span>
      {label}
    </span>
  </Link>
);

export const AccountMenu = ({
  onClose,
}: Props) => {
  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/", {
      replace: true,
    });
  };

  if (!user) {
    return (
      <div
        role="menu"
        aria-label="Account menu"
        className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl shadow-slate-950/60"
      >
        <div className="border-b border-slate-700 px-3 py-3">
          <p className="text-sm font-bold text-slate-100">
            Welcome to Wine Aggregator
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Sign in to follow wines and keep track of
            your comments.
          </p>
        </div>

        <div className="mt-1 space-y-1">
          <MenuLink
            to="/login"
            label="Sign in"
            onClick={onClose}
            icon={
              <LogIn
                aria-hidden="true"
                className="h-4 w-4"
              />
            }
          />

          <MenuLink
            to="/register"
            label="Create account"
            onClick={onClose}
            icon={
              <UserPlus
                aria-hidden="true"
                className="h-4 w-4"
              />
            }
          />
        </div>
      </div>
    );
  }

  const initial =
    user.username
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <div
      role="menu"
      aria-label="Account menu"
      className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl shadow-slate-950/60"
    >
      <div className="border-b border-slate-700 px-3 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-teal-400/35 bg-teal-400/10 text-sm font-bold text-teal-200">
            {initial}
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Signed in as
            </p>

            <p className="mt-0.5 truncate text-sm font-bold text-slate-100">
              {user.username}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-1 space-y-1">
        <MenuLink
          to="/me/followed-wines"
          label="Followed wines"
          onClick={onClose}
          icon={
            <Wine
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
        />

        <MenuLink
          to="/me/comments"
          label="My comments"
          onClick={onClose}
          icon={
            <MessageSquareText
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
        />

        <MenuLink
          to="/settings"
          label="Settings"
          onClick={onClose}
          icon={
            <Settings
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
        />
      </div>

      <div className="my-1.5 border-t border-slate-700" />

      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-300 transition hover:bg-rose-950/70 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400/70"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-rose-400/20 bg-rose-400/10 text-rose-300 transition group-hover:border-rose-400/45 group-hover:bg-rose-400/15">
          <LogOut
            aria-hidden="true"
            className="h-4 w-4"
          />
        </span>

        <span>
          Sign out
        </span>
      </button>
    </div>
  );
};