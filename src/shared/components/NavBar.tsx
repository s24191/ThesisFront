import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  Menu,
  Search,
  User as UserIcon,
  Wine,
  X,
} from "lucide-react";
import {AccountMenu} from "@/features/auth/components/AccountMenu.tsx";

const NAV_ITEMS = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Explore wines",
    to: "/wines?page=1&pageSize=25",
  },
] as const;

export const NavBar = () => {
  const [accountOpen, setAccountOpen] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const accountMenuRef =
    useRef<HTMLDivElement | null>(null);

  const mobileMenuRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      const target = event.target as Node;

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(target)
      ) {
        setAccountOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setAccountOpen(false);
      setMobileMenuOpen(false);
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const closeAllMenus = () => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 text-slate-100 backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <Link
          to="/"
          onClick={closeAllMenus}
          className="group flex items-center gap-2 rounded-lg text-base font-bold tracking-tight text-slate-50 transition focus:outline-none focus:ring-2 focus:ring-teal-400/70"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-teal-400/35 bg-teal-400/10 text-teal-300 transition group-hover:border-teal-300 group-hover:bg-teal-400 group-hover:text-slate-950">
            <Wine
              aria-hidden="true"
              className="h-4 w-4"
            />
          </span>

          <span>
            Wine
            <span className="text-teal-300">
              Aggregator
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-teal-400/10 text-teal-200"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/wines?page=1&pageSize=25"
            aria-label="Search wines"
            onClick={closeAllMenus}
            className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400/70 sm:inline-flex"
          >
            <Search
              aria-hidden="true"
              className="h-5 w-5"
            />
          </Link>

          <div
            ref={accountMenuRef}
            className="relative"
          >
            <button
              type="button"
              aria-label={
                accountOpen
                  ? "Close account menu"
                  : "Open account menu"
              }
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => {
                setAccountOpen(
                  (isOpen) => !isOpen,
                );

                setMobileMenuOpen(false);
              }}
              className={[
                "grid h-9 w-9 place-items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-teal-400/70",
                accountOpen
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-200"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100",
              ].join(" ")}
            >
              <UserIcon
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>

            {accountOpen && (
              <AccountMenu
                onClose={() => setAccountOpen(false)}
              />
            )}
          </div>

          <div
            ref={mobileMenuRef}
            className="relative md:hidden"
          >
            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => {
                setMobileMenuOpen(
                  (isOpen) => !isOpen,
                );

                setAccountOpen(false);
              }}
              className={[
                "grid h-9 w-9 place-items-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-teal-400/70",
                mobileMenuOpen
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-200"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100",
              ].join(" ")}
            >
              {mobileMenuOpen ? (
                <X
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              ) : (
                <Menu
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              )}
            </button>

            {mobileMenuOpen && (
              <div
                id="mobile-navigation"
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl shadow-slate-950/50"
              >
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={closeAllMenus}
                    className={({ isActive }) =>
                      [
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                        isActive
                          ? "bg-teal-400/10 text-teal-200"
                          : "text-slate-300 hover:bg-slate-800 hover:text-slate-50",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="my-1 border-t border-slate-700" />

                <Link
                  to="/wines?page=1&pageSize=25"
                  onClick={closeAllMenus}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-teal-200"
                >
                  <Search
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  Search wines
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};