import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";

import { NavBar } from "@/components/NavBar";
import { Home } from "@/pages/Home";
import { WinesPage } from "@/pages/WinesPage";
import { LoginForm } from "@/features/user/Login/LoginForm";
import { RegisterForm } from "@/features/user/Register/RegisterForm";
import { useAuthStore } from "@/store/authStore";
import {WinePage} from "@/pages/WinePage.tsx";

export const AppRoutes: React.FC = () => {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <NavBar />

        <div className="flex-grow flex items-center justify-center p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/wines" element={<WinesPage />} />
            <Route path="/wines/:id" element={<WinePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};