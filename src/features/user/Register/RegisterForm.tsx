import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "./schema";
import { registerUser } from "@/features/user/authService";
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
      const res = await registerUser(data);
      if (res.access_token) {
        setToken(res.access_token);
      }
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Username</label>
        <input placeholder="Username" {...register("username")} />
        {errors.username && <p>{errors.username.message}</p>}
      </div>

      <div>
        <label>First Name</label>
        <input placeholder="First name" {...register("first_name")} />
        {errors.first_name && <p>{errors.first_name.message}</p>}
      </div>

      <div>
        <label>Last Name</label>
        <input placeholder="Last name" {...register("last_name")} />
        {errors.last_name && <p>{errors.last_name.message}</p>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" placeholder="you@gmail.com" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering…" : "Register"}
      </button>
    </form>
  );
};
