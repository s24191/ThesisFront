import {useState,} from "react";
import {zodResolver,} from "@hookform/resolvers/zod";
import {useForm,} from "react-hook-form";
import {Link, useNavigate, useSearchParams,} from "react-router-dom";
import {loginUser,} from "@/features/auth/api/authService";
import {useAuthStore} from "@/features/auth/store/authStore";
import {type LoginFormValues, loginSchema} from "@/features/auth/schemas/loginSchema";

export const LoginForm = () => {
  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const setToken = useAuthStore(
    (state) => state.setToken,
  );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getSafeRedirectPath = (redirect: string | null,): string => {
    if (!redirect) {return "/";}
    if (
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
    ) {
      return redirect;
    }
    return "/";
  };
  const redirectTo = getSafeRedirectPath(
    searchParams.get("redirect"),
  );

  const onSubmit = async (
    values: LoginFormValues,
  ) => {
    try {
      setSubmitError(null);

      const response = await loginUser(
        values.email,
        values.password,
      );

      setToken(response.access_token);

      navigate(redirectTo, {replace: true,});
    } catch {
      setSubmitError(
        "We couldn’t sign you in with those details. Check your email and password, then try again.",
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

      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-sm font-semibold text-slate-200"
        >
          Email address
        </label>

        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email
              ? "login-email-error"
              : undefined
          }
          {...register("email")}
          className={[
            "w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition focus:outline-none focus:ring-2",
            errors.email
              ? "border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/20"
              : "border-slate-700 focus:border-teal-400 focus:ring-teal-400/20",
          ].join(" ")}
        />

        {errors.email && (
          <p
            id="login-email-error"
            className="mt-1.5 text-xs font-medium text-rose-300"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label
            htmlFor="login-password"
            className="block text-sm font-semibold text-slate-200"
          >
            Password
          </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-teal-300 hover:text-teal-200"
            >
              Forgot password?
            </Link>
        </div>

        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password
              ? "login-password-error"
              : undefined
          }
          {...register("password")}
          className={[
            "w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition focus:outline-none focus:ring-2",
            errors.password
              ? "border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/20"
              : "border-slate-700 focus:border-teal-400 focus:ring-teal-400/20",
          ].join(" ")}
        />

        {errors.password && (
          <p
            id="login-password-error"
            className="mt-1.5 text-xs font-medium text-rose-300"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl border border-teal-300 bg-teal-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:border-teal-200 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting
          ? "Signing in…"
          : "Sign in"}
      </button>
    </form>
  );
};