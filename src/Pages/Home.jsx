import { useEffect, useState } from "react";
import { levels } from "../assets/assets";

const USER_KEY = "eco_user_progress";

function StarRating({ score, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-base ${i < score ? "text-yellow-400" : "text-gray-300"}`}>★</span>
      ))}
    </div>
  );
}

export default function Home({ onSelectLevel }) {
  const [progress, setProgress] = useState({});
  const [hoveredLevel, setHoveredLevel] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(USER_KEY)) || {};
      setProgress(saved);
    } catch {
      setProgress({});
    }
  }, []);

  const isUnlocked = (levelId, index) => {
    if (index === 0) return true;
    const prevLevel = levels[index - 1];
    const prevData = progress?.[prevLevel.id] || {};
    return (
      Object.keys(prevData).length >= prevLevel.appliances.length &&
      Object.values(prevData).every((score) => score > 3)
    );
  };

  const getLevelScore = (level) => {
    const levelData = progress?.[level.id] || {};
    const scores = Object.values(levelData);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getCompletedCount = (level) => {
    return Object.keys(progress?.[level.id] || {}).length;
  };

  const clearProgress = () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      localStorage.removeItem(USER_KEY);
      setProgress({});
    }
  };

  const totalCompleted = levels.filter(
    (l) =>
      Object.keys(progress?.[l.id] || {}).length >= l.appliances.length &&
      Object.values(progress?.[l.id] || {}).every((s) => s > 3)
  ).length;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0f4c2a 100%)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Header */}
      <div className="relative pt-10 pb-6 px-6 text-center">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="text-5xl">⚡</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                EcoEnergy Quest
              </h1>
              <p className="text-emerald-400 font-semibold text-sm tracking-widest uppercase mt-1">
                Save Energy · Save the Planet
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Overall Progress</span>
              <span>{totalCompleted} / {levels.length} levels mastered</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(totalCompleted / levels.length) * 100}%`,
                  background: "linear-gradient(90deg, #22c55e, #4ade80)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Level Cards */}
      <div className="px-6 pb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {levels.map((level, index) => {
            const unlocked = isUnlocked(level.id, index);
            const avgScore = getLevelScore(level);
            const completed = getCompletedCount(level);
            const isFullyDone = completed >= level.appliances.length && avgScore > 3;

            return (
              <div
                key={level.id}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                onClick={() => unlocked && onSelectLevel(level.id)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  unlocked
                    ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
                    : "cursor-not-allowed opacity-60"
                }`}
                style={{
                  background: unlocked
                    ? "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
                    : "rgba(30,30,50,0.4)",
                  backdropFilter: "blur(10px)",
                  border: unlocked
                    ? isFullyDone
                      ? "1px solid rgba(74,222,128,0.5)"
                      : "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: hoveredLevel === level.id && unlocked
                    ? "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(74,222,128,0.2)"
                    : "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {/* Level number badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{
                      background: unlocked ? `linear-gradient(135deg, ${level.color.replace("from-","").replace(" to-",", ")})` : "#555",
                    }}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 right-3 z-10">
                  {!unlocked ? (
                    <span className="text-lg">🔒</span>
                  ) : isFullyDone ? (
                    <span className="text-lg">✅</span>
                  ) : completed > 0 ? (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                      IN PROGRESS
                    </span>
                  ) : null}
                </div>

                {/* Card Content */}
                <div className="p-6 pt-10">
                  <div className="text-5xl mb-3">{level.icon}</div>
                  <h2 className="text-xl font-black text-white mb-1">{level.name}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{level.desc}</p>

                  {/* Appliances list */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {level.appliances.map((ap) => {
                      const score = progress?.[level.id]?.[ap];
                      const done = score !== undefined;
                      const passed = score > 3;
                      return (
                        <span
                          key={ap}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            done
                              ? passed
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-white/5 text-gray-400 border border-white/10"
                          }`}
                        >
                          {done ? (passed ? "✓" : "✗") : "○"} {ap.replace("_", " ")}
                        </span>
                      );
                    })}
                  </div>

                  {/* Score & Progress */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Avg Score</div>
                      <StarRating score={avgScore} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Progress</div>
                      <div className="text-sm font-black text-white">
                        {completed}/{level.appliances.length}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(completed / level.appliances.length) * 100}%`,
                        background: isFullyDone
                          ? "linear-gradient(90deg, #22c55e, #4ade80)"
                          : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                      }}
                    />
                  </div>
                </div>

                {/* Hover glow effect */}
                {unlocked && (
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, transparent 60%, rgba(74,222,128,0.05))`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Instructions & Reset */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            💡 Complete all appliances with a score &gt; 3/5 to unlock the next level
          </p>
          <button
            onClick={clearProgress}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors underline"
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}
