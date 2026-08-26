import {
  useEffect,
  useState,
} from "react";

import {
  wineFollowApi,
} from "@/features/wines/api/wineFollowApi";

type FollowState =
  | "loading"
  | "followed"
  | "not-followed";

type FollowWineButtonProps = {
  wineId: number;
  isLoggedIn: boolean;
};

export const FollowWineButton = ({
  wineId,
  isLoggedIn,
}: FollowWineButtonProps) => {
  const [followState, setFollowState] =
    useState<FollowState>("loading");

  useEffect(() => {
    if (!wineId || !isLoggedIn) {
      setFollowState("not-followed");
      return;
    }

    const loadFollowStatus = async () => {
      try {
        const isFollowing =
          await wineFollowApi.getStatus(wineId);

        setFollowState(
          isFollowing
            ? "followed"
            : "not-followed",
        );
      } catch {
        /*
         * If the backend returns 401, the shared Axios
         * interceptor clears auth and sends the user to login.
         */
        setFollowState("not-followed");
      }
    };

    void loadFollowStatus();
  }, [
    wineId,
    isLoggedIn,
  ]);

  const toggleFollow = async () => {
    if (
      !wineId ||
      followState === "loading" ||
      !isLoggedIn
    ) {
      return;
    }

    const previousState = followState;

    setFollowState("loading");

    try {
      if (previousState === "followed") {
        await wineFollowApi.unfollow(wineId);

        setFollowState("not-followed");
      } else {
        await wineFollowApi.follow(wineId);

        setFollowState("followed");
      }
    } catch {
      setFollowState(previousState);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        void toggleFollow();
      }}
      disabled={followState === "loading"}
      aria-pressed={followState === "followed"}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        followState === "followed"
          ? "border-teal-400/60 bg-teal-950 text-teal-100 hover:border-rose-400/60 hover:bg-rose-950 hover:text-rose-100"
          : "border-slate-600 bg-slate-800 text-slate-100 hover:border-teal-400 hover:bg-teal-400 hover:text-slate-950",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "text-base leading-none",
          followState === "followed"
            ? "text-teal-300"
            : "text-slate-400",
        ].join(" ")}
      >
        {followState === "followed"
          ? "✓"
          : "+"}
      </span>

      <span>
        {followState === "loading"
          ? "Loading…"
          : followState === "followed"
            ? "Following"
            : "Follow"}
      </span>
    </button>
  );
};