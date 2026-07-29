import React, { useEffect, useState } from "react";
import {
  fetchTasteSummary,
  fetchMyTasteVote,
  upsertMyTasteVote,
} from "@/features/wines/api";
import type { WineTasteSummary, WineTasteVote } from "@/features/wines/types";
import { useAuthStore } from "@/store/authStore";

type Props = {
  wineId: number;
};

const clamp0to10 = (v: number) => Math.max(0, Math.min(10, v));

const makeSegment = (avg: number | null | undefined): { start: string; width: string } => {
  if (avg == null) return { start: "0%", width: "0%" };

  const widthFrac = 0.15; // 15% of the bar
  const norm = Math.max(0, Math.min(10, avg)) / 10; // 0..1

  let left = norm - widthFrac / 2;
  left = Math.max(0, Math.min(1 - widthFrac, left)); // keep inside [0, 1 - width]

  return {
    start: `${left * 100}%`,
    width: `${widthFrac * 100}%`, // 15%
  };
};


export const WineTasteSection: React.FC<Props> = ({ wineId }) => {
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  const [summary, setSummary] = useState<WineTasteSummary | null>(null);
  const [myVote, setMyVote] = useState<WineTasteVote | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingMyVote, setLoadingMyVote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoteOpen, setIsVoteOpen] = useState(false);

  useEffect(() => {
    if (!wineId) return;
    const load = async () => {
      try {
        setLoadingSummary(true);
        setError(null);
        const data = await fetchTasteSummary(wineId);
        setSummary(data);
      } catch (e: any) {
        setError(e.message ?? "Failed to load taste summary");
      } finally {
        setLoadingSummary(false);
      }
    };
    load();
  }, [wineId]);

  // Load my vote if logged in
  useEffect(() => {
    if (!wineId || !isLoggedIn || !token) {
      setMyVote(null);
      return;
    }
    const load = async () => {
      try {
        setLoadingMyVote(true);
        const data = await fetchMyTasteVote(wineId, token);
        if (data) {
          setMyVote(data);
        } else {
          setMyVote(null);
        }
      } catch (e) {
        // silent for now
      } finally {
        setLoadingMyVote(false);
      }
    };
    load();
  }, [wineId, isLoggedIn, token]);

  const handleChange = (field: keyof WineTasteVote, value: number) => {
    const v = clamp0to10(value);
    setMyVote((prev) => ({
      body: prev?.body ?? 5,
      tannin: prev?.tannin ?? 5,
      sweetness: prev?.sweetness ?? 5,
      acidity: prev?.acidity ?? 5,
      [field]: v,
    }));
  };

  const handleSave = async () => {
    if (!isLoggedIn || !token || !myVote) return;
    try {
      setSaving(true);
      setError(null);
      const saved = await upsertMyTasteVote(wineId, token, myVote);
      setMyVote(saved);
      const updatedSummary = await fetchTasteSummary(wineId);
      setSummary(updatedSummary);
    } catch (e: any) {
      setError(e.message ?? "Failed to save taste vote");
    } finally {
      setSaving(false);
    }
  };

  const votesCount = summary?.votes_count ?? 0;

  const bodySeg = makeSegment(summary?.body);
  const tanninSeg = makeSegment(summary?.tannin);
  const sweetSeg = makeSegment(summary?.sweetness);
  const acidSeg = makeSegment(summary?.acidity);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-2">What does this wine taste like?</h2>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      {loadingSummary && <p className="text-xs text-gray-400 mb-1">Loading taste profile...</p>}

      {/* Community sliders */}
      <div className="grid gap-3 md:grid-cols-2 text-xs text-gray-300 bg-slate-900 rounded-lg px-4 py-3">
      <TasteSlider
        labelLeft="Light"
        labelRight="Bold"
        startPercent={bodySeg.start}
        widthPercent={bodySeg.width}
      />
      <TasteSlider
        labelLeft="Smooth"
        labelRight="Tannic"
        startPercent={tanninSeg.start}
        widthPercent={tanninSeg.width}
      />
      <TasteSlider
        labelLeft="Dry"
        labelRight="Sweet"
        startPercent={sweetSeg.start}
        widthPercent={sweetSeg.width}
      />
      <TasteSlider
        labelLeft="Soft"
        labelRight="Acidic"
        startPercent={acidSeg.start}
        widthPercent={acidSeg.width}
      />
    </div>

      <p className="mt-1 text-xs text-gray-500">
        Based on {votesCount} {votesCount === 1 ? "vote" : "votes"}.
      </p>

      {/* My vote controls */}
      {isLoggedIn && isVoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md bg-slate-900 text-gray-100 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Your taste vote (0–10 for each trait)
              </h3>
              <button
                onClick={() => setIsVoteOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <UserVoteSlider
                label="Body"
                value={myVote?.body ?? 5}
                onChange={(v) => handleChange("body", v)}
              />
              <UserVoteSlider
                label="Tannin"
                value={myVote?.tannin ?? 5}
                onChange={(v) => handleChange("tannin", v)}
              />
              <UserVoteSlider
                label="Sweetness"
                value={myVote?.sweetness ?? 5}
                onChange={(v) => handleChange("sweetness", v)}
              />
              <UserVoteSlider
                label="Acidity"
                value={myVote?.acidity ?? 5}
                onChange={(v) => handleChange("acidity", v)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsVoteOpen(false)}
                className="px-3 py-1 rounded-md border text-xs bg-white text-slate-900 border-slate-600 hover:bg-slate-600 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleSave();
                  setIsVoteOpen(false);
                }}
                disabled={saving || loadingMyVote}
                className="px-3 py-1 rounded-md border text-xs bg-white text-slate-900 border-slate-600 hover:bg-slate-600 hover:text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save taste vote"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* My vote controls trigger */}
      {isLoggedIn && (
        <div className="mt-3">
          <button
            onClick={() => setIsVoteOpen(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm bg-white text-slate-900 border-slate-600 hover:bg-slate-600 hover:text-white disabled:opacity-50"
          >
            Rate taste
          </button>
        </div>
      )}

      {!isLoggedIn && (
        <p className="mt-3 text-xs text-gray-500">
          Log in to add your own taste vote.
        </p>
      )}

    </section>
  );
};

type TasteSliderProps = {
  labelLeft: string;
  labelRight: string;
  startPercent: string;
  widthPercent: string;
};

const TasteSlider: React.FC<TasteSliderProps> = ({
  labelLeft,
  labelRight,
  startPercent,
  widthPercent,
}) => (
  <div>
    <div className="flex justify-between mb-1 text-xs text-gray-300">
      <span>{labelLeft}</span>
      <span>{labelRight}</span>
    </div>
    <div className="h-1.5 rounded-full bg-gray-700 relative overflow-hidden">
      <div
        className="absolute top-0 h-full bg-red-700 rounded-full"
        style={{ left: startPercent, width: widthPercent }}
      />
    </div>
  </div>
);

type UserVoteSliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

const UserVoteSlider: React.FC<UserVoteSliderProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className="flex items-center gap-3 text-sm text-gray-200">
    <span className="w-20">{label}</span>
    <input
      type="range"
      min={0}
      max={10}
      step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 accent-red-700"
    />
    <span className="w-6 text-right text-xs text-gray-300">{value}</span>
  </div>
);
