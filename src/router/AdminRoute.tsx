import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type Props = {
  children: React.ReactNode;
};

export const AdminRoute: React.FC<Props> = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const authChecked = useAuthStore((s) => s.authChecked);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (token && !authChecked) {
      fetchUser();
    }
  }, [token, authChecked, fetchUser]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking admin access...
      </div>
    );
  }

  if (!user?.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
