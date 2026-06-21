import React, { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

type FollowState = "loading" | "followed" | "not-followed";

type Props = {
  wineId: number;
  isLoggedIn: boolean;
  token: string | null;
};

export const FollowWineButton: React.FC<Props> = ({ wineId, isLoggedIn, token }) => {
  const [followState, setFollowState] = useState<FollowState>("loading");

   useEffect(() => {
    if (!wineId || !isLoggedIn || !token) {
      setFollowState("not-followed");
      return;
    }

    const loadFollow = async () => {
      try {
        const res = await fetch(`${API_URL}/wines/${wineId}/follow`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const isFollowing = (await res.json()) as boolean;
        setFollowState(isFollowing ? "followed" : "not-followed");
      } catch {
        setFollowState("not-followed");
      }
    };

    loadFollow();
  }, [wineId, isLoggedIn, token]);


  const toggleFollow = async () => {
    if (!wineId || followState === "loading" || !isLoggedIn || !token) return;

    const method = followState === "followed" ? "DELETE" : "POST";
    const prev = followState;
    setFollowState("loading");

    try {
      const res = await fetch(`${API_URL}/wines/${wineId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFollowState(method === "POST" ? "followed" : "not-followed");
    } catch {
      setFollowState(prev);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={followState === "loading"}
      className="inline-flex items-center px-3 py-1 rounded-full border text-sm
                 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white
                 disabled:opacity-50"
    >
      {followState === "followed" ? "Unfollow" : "Follow"}
    </button>
  );
};
