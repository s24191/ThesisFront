import {useState,} from "react";
import {zodResolver,} from "@hookform/resolvers/zod";
import {useForm, type UseFormRegisterReturn,} from "react-hook-form";
import {useNavigate,} from "react-router-dom";
import {useAuthStore} from "@/features/auth/store/authStore";
import {type RegisterFormValues, registerSchema} from "@/features/auth/schemas/registerSchema";
import {loginUser, registerUser} from "@/features/auth/api/authService";

type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
  autoComplete?: string;
  type?: "email" | "password" | "text";
  placeholder?: string;
  registration: UseFormRegisterReturn;
};

const TextField = ({
  id,
  label,
  error,
  autoComplete,
  type = "text",
  placeholder,
  registration,
}: TextFieldProps) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-semibold text-slate-200"
    >
      {label}
    </label>

    <input
      id={id}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      aria-invalid={Boolean(error)}
      aria-describedby={
        error
          ? `${id}-error`
          : undefined
      }
      {...registration}
      className={[
        "w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition focus:outline-none focus:ring-2",
        error
          ? "border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/20"
          : "border-slate-700 focus:border-teal-400 focus:ring-teal-400/20",
      ].join(" ")}
    />

    {error && (
      <p
        id={`${id}-error`}
        className="mt-1.5 text-xs font-medium text-rose-300"
      >
        {error}
      </p>
    )}
  </div>
);

export const RegisterForm = () => {
  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const setToken = useAuthStore(
    (state) => state.setToken,
  );

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (
    values: RegisterFormValues,
  ) => {
    try {
      setSubmitError(null);

      await registerUser(values);

      const loginResponse = await loginUser(
        values.email,
        values.password,
      );

      setToken(loginResponse.access_token);

      navigate("/");
    } catch {
      setSubmitError(
        "We couldn’t create your account. The email or username may already be in use. Please review your details and try again.",
      );
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/40 bg-rose-950/40 px-3.5 py-3 text-sm leading-6 text-rose-100"
        >
          {submitError}
        </div>
      )}

      <TextField
        id="register-username"
        label="Username"
        autoComplete="username"
        placeholder="Your public wine profile name"
        error={errors.username?.message}
        registration={register("username")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="register-first-name"
          label="First name"
          autoComplete="given-name"
          placeholder="Optional"
          error={errors.first_name?.message}
          registration={register("first_name")}
        />

        <TextField
          id="register-last-name"
          label="Last name"
          autoComplete="family-name"
          placeholder="Optional"
          error={errors.last_name?.message}
          registration={register("last_name")}
        />
      </div>

      <TextField
        id="register-email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        registration={register("email")}
      />

      <div>
        <TextField
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          registration={register("password")}
        />

        <p className="mt-1.5 text-xs text-slate-500">
          Use at least 6 characters.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl border border-teal-300 bg-teal-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:border-teal-200 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting
          ? "Creating account…"
          : "Create account"}
      </button>
    </form>
  );
};