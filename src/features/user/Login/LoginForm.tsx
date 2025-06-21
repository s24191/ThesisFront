import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "./schema";
import { loginUser } from "@/features/user/authService";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const { setToken } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

const navigate = useNavigate();

const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await loginUser(data.email, data.password);
      setToken(res.access_token);
       navigate("/");

    } catch {
      alert("Login failed");
    }
  };

 return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Email</label>
        <input type="email" placeholder="you@gmail.com" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Login"}
      </button>
    </form>
  );
};