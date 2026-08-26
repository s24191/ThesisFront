import {
  type FormEvent,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const DISCOVERY_LINKS = [
  {
    label: "Top rated",
    description: "Find wines with the strongest community scores.",
    to: "/wines?sort=rating-desc&page=1&pageSize=25",
    icon: "★",
    accentClass:
      "border-amber-400/35 bg-amber-400/10 text-amber-200 hover:border-amber-300 hover:bg-amber-400/15",
  },
  {
    label: "Best value",
    description: "Browse the most affordable bottles first.",
    to: "/wines?sort=price-asc&page=1&pageSize=25",
    icon: "↓",
    accentClass:
      "border-teal-400/35 bg-teal-400/10 text-teal-200 hover:border-teal-300 hover:bg-teal-400/15",
  },
  {
    label: "Small bottles",
    description: "Explore compact formats and smaller volumes.",
    to: "/wines?sort=volume-asc&page=1&pageSize=25",
    icon: "↘",
    accentClass:
      "border-sky-400/35 bg-sky-400/10 text-sky-200 hover:border-sky-300 hover:bg-sky-400/15",
  },
  {
    label: "Recent vintages",
    description: "Start with the newest wines in the collection.",
    to: "/wines?sort=year-desc&page=1&pageSize=25",
    icon: "↗",
    accentClass:
      "border-violet-400/35 bg-violet-400/10 text-violet-200 hover:border-violet-300 hover:bg-violet-400/15",
  },
];

const BROWSE_LINKS = [
  {
    label: "France",
    to: "/wines?country=France&page=1&pageSize=25",
  },
  {
    label: "Italy",
    to: "/wines?country=Italy&page=1&pageSize=25",
  },
  {
    label: "Spain",
    to: "/wines?country=Spain&page=1&pageSize=25",
  },
  {
    label: "Portugal",
    to: "/wines?country=Portugal&page=1&pageSize=25",
  },
  {
    label: "Red wines",
    to: "/wines?search=red&page=1&pageSize=25",
  },
  {
    label: "White wines",
    to: "/wines?search=white&page=1&pageSize=25",
  },
  {
    label: "Sparkling",
    to: "/wines?search=sparkling&page=1&pageSize=25",
  },
  {
    label: "Rosé wines",
    to: "/wines?search=ros%C3%A9&page=1&pageSize=25",
  },
];

export const Home = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/wines?search=${encodeURIComponent(
            query,
          )}&page=1&pageSize=25`
        : "/wines?page=1&pageSize=25",
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative border-b border-slate-800">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.08),_transparent_30%)]"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">
              Wine discovery, made practical
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Find the right bottle.
              <span className="block text-teal-300">
                Compare the right price.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Wine Aggregator brings wines, ratings, and
              retailer offers together in one place—so you
              can spend less time comparing tabs and more
              time choosing a bottle you will enjoy.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">
                  Search for a wine
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by wine, producer, region, or country…"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl border border-teal-300 bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:border-teal-200 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Search wines →
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span>
                Search by name, producer, region, or country
              </span>

              <span
                aria-hidden="true"
                className="hidden text-slate-700 sm:inline"
              >
                •
              </span>

              <Link
                to="/wines?page=1&pageSize=25"
                className="font-semibold text-teal-300 transition hover:text-teal-200"
              >
                Browse all wines →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Start exploring
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              Choose a quick path
            </h2>
          </div>

          <Link
            to="/wines?page=1&pageSize=25"
            className="text-sm font-semibold text-teal-300 transition hover:text-teal-200"
          >
            Open full catalogue →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={[
                "group rounded-2xl border p-5 transition",
                item.accentClass,
              ].join(" ")}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-current/25 bg-slate-950/20 text-lg font-bold">
                {item.icon}
              </span>

              <h3 className="mt-4 text-base font-bold">
                {item.label}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-300/85">
                {item.description}
              </p>

              <span className="mt-4 block text-sm font-semibold">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Why use it
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              Make better wine decisions with less effort
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <span className="text-xl text-teal-300">
                01
              </span>

              <h3 className="mt-4 text-base font-bold text-slate-100">
                Compare offers
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                See retailer pricing alongside each wine,
                helping you identify the best available
                offer before you buy.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <span className="text-xl text-amber-300">
                02
              </span>

              <h3 className="mt-4 text-base font-bold text-slate-100">
                Use ratings meaningfully
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sort by ratings and review volume, rather
                than relying on a score with no context.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <span className="text-xl text-violet-300">
                03
              </span>

              <h3 className="mt-4 text-base font-bold text-slate-100">
                Refine the catalogue
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Narrow wines by country and region, then
                combine sorting priorities such as price
                and bottle volume.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                Browse by preference
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50">
                Start with something familiar
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Use these shortcuts to enter the catalogue
                with a starting filter, then refine results
                using the full filter bar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              {BROWSE_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-teal-400 hover:bg-teal-400/10 hover:text-teal-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-teal-400/30 bg-teal-400/10 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-50">
                Ready to find your next bottle?
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Explore wines, compare prices, and refine
                your search in one place.
              </p>
            </div>

            <Link
              to="/wines?page=1&pageSize=25"
              className="shrink-0 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Explore wines →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};