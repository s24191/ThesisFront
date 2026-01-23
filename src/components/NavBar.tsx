import React, { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User as UserIcon } from "lucide-react"
import { useAuthStore } from "@/store/authStore";


export const NavBar: React.FC = () => {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const onLogout = () => {
    logout()
    setOpen(false)
    navigate("/")
  }

  return (
    <nav className="w-full bg-gray-800 px-6 py-4 flex justify-between items-center text-white relative">
      <Link to="/" className="text-xl font-bold">
        Wine Aggregator
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <UserIcon size={24} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg z-10 overflow-hidden">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-xs text-gray-500">Signed in as</div>
                  <div className="text-sm font-semibold truncate">
                    {user.username}
                  </div>
                </div>

                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Settings
                </Link>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};