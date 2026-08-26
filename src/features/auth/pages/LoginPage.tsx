import {
  Link,
} from "react-router-dom";
import {LoginForm} from "@/features/auth/components/LoginForm.tsx";

export const LoginPage = () => (
  <main className="grid min-h-[calc(100vh-65px)] place-items-center bg-slate-950 px-4 py-10 text-slate-100">
    <section className="w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/75 shadow-2xl shadow-slate-950/40">
        <div className="border-b border-slate-700 bg-gradient-to-br from-teal-400/10 via-slate-900 to-slate-900 px-6 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
            Welcome back
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Sign in to your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Follow wines, keep track of your comments, and
            make your wine search personal.
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <LoginForm />

          <p className="mt-6 border-t border-slate-700 pt-5 text-center text-sm text-slate-400">
            New to Wine Aggregator?{" "}

            <Link
              to="/register"
              className="font-semibold text-teal-300 transition hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400/70"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  </main>
);