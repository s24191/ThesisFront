import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "./schema";
import {loginUser, registerUser} from "@/features/user/authService";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
export const RegisterForm = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);
      const loginRes = await loginUser(
        data.email,
        data.password,
      );
      setToken(loginRes.access_token);
      navigate("/");
    } catch (e) {
      alert("Registration failed");
      console.error(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-white rounded-md p-6 shadow"
    >
      {/* Username */}
      <label className="block text-sm font-medium text-gray-700">
        Username
        <input
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          {...register("username")}
        />
      </label>
      {errors.username && (
        <p className="text-xs text-red-600 mt-1">
          {errors.username.message}
        </p>
      )}

      {/* First name */}
      <label className="mt-3 block text-sm font-medium text-gray-700">
        First Name
        <input
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          {...register("first_name")}
        />
      </label>
      {errors.first_name && (
        <p className="text-xs text-red-600 mt-1">
          {errors.first_name.message}
        </p>
      )}

      {/* Last name */}
      <label className="mt-3 block text-sm font-medium text-gray-700">
        Last Name
        <input
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          {...register("last_name")}
        />
      </label>
      {errors.last_name && (
        <p className="text-xs text-red-600 mt-1">
          {errors.last_name.message}
        </p>
      )}

      {/* Email */}
      <label className="mt-3 block text-sm font-medium text-gray-700">
        Email
        <input
          type="email"
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          {...register("email")}
        />
      </label>
      {errors.email && (
        <p className="text-xs text-red-600 mt-1">
          {errors.email.message}
        </p>
      )}

      {/* Password */}
      <label className="mt-3 block text-sm font-medium text-gray-700">
        Password
        <input
          type="password"
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          {...register("password")}
        />
      </label>
      {errors.password && (
        <p className="text-xs text-red-600 mt-1">
          {errors.password.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Registering…" : "Register"}
      </button>
    </form>
  );
};
