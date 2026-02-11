import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import { AccountMenu } from "@/components/AccountMenu";

export const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">
          Wine Aggregator
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {open && <AccountMenu onClose={() => setOpen(false)} />}
        </div>
      </div>
    </nav>
  );
};
