import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type Props = {
  onClose: () => void;
};

export const AccountMenu: React.FC<Props> = ({ onClose }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50">
        <div className="py-1" role="menu">
          <Link
            to="/login"
            onClick={onClose}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50">
      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500">Signed in as</p>
        <p className="text-sm font-medium text-gray-900 break-all">
          {user.username}
        </p>
      </div>
      <div className="py-1" role="menu">
        <Link
          to="/me/followed-wines"
          onClick={onClose}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          My followed wines
        </Link>
        <Link
          to="/me/comments"
          onClick={onClose}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          My comments
        </Link>
        <Link
          to="/settings"
          onClick={onClose}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Settings
        </Link>
        <button
          onClick={onLogout}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
