import { useState, useEffect } from "react";
import { levels, applianceHotspots, applianceInsights } from "../assets/assets";
import QuizModal from "./QuizModal";

const USER_KEY = "eco_user_progress";

function ScoreBadge({ score }) {
  const stars = score > 3 ? "🌟" : score > 0 ? "⭐" : "";
  return (
    <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white ${
      score > 3 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    }`}>
      {score}
    </div>
  );
}

function FinalResultOverlay({ status, levelName, onClose, onRetry }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl animate-bounce-in">
        {status === "win" ? (
          <>
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-black text-emerald-600 mb-2">Level Complete!</h2>
            <p className="text-gray-600 mb-1 font-semibold">{levelName}</p>
            <p className="text-sm text-gray-500 mb-6">All appliances mastered with 4+ stars!</p>
            <div className="flex gap-1 justify-center mb-6">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-2xl text-yellow-400">★</span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-2xl font-black text-orange-500 mb-2">Keep Going!</h2>
            <p className="text-gray-600 mb-1 font-semibold">{levelName}</p>
            <p className="text-sm text-gray-500 mb-6">Some appliances need a higher score. Study and try again!</p>
          </>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors text-sm"
          >
            🏠 Home
          </button>
          {status !== "win" && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold transition-colors text-sm hover:from-blue-600 hover:to-blue-700"
            >
              🔄 Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomScene({ levelId, onGoHome }) {
  const [progress, setProgress] = useState({});
  const [activeAppliance, setActiveAppliance] = useState(null);
  const [showFinal, setShowFinal] = useState(false);
  const [finalStatus, setFinalStatus] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const level = levels.find((l) => l.id === levelId);
  const hotspots = applianceHotspots[levelId] || {};

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(USER_KEY)) || {};
      setProgress(saved);
    } catch {
      setProgress({});
    }
  }, []);

  const saveProgress = (data) => {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setProgress(data);
  };

  const isCompleted = (applianceId) => {
    return progress?.[levelId]?.[applianceId] !== undefined;
  };

  const getScore = (applianceId) => {
    return progress?.[levelId]?.[applianceId] ?? null;
  };

  const hasPassed = (applianceId) => {
    return progress?.[levelId]?.[applianceId] > 3;
  };

  const openQuiz = (applianceId) => {
    // Allow clicking if not yet attempted, OR if previously failed (score <= 3)
    if (hasPassed(applianceId)) return;
    setActiveAppliance(applianceId);
  };

  const handleQuizComplete = (score) => {
    const updated = {
      ...progress,
      [levelId]: {
        ...(progress[levelId] || {}),
        [activeAppliance]: score,
      },
    };
    saveProgress(updated);
    setActiveAppliance(null);

    // Check if all appliances done
    const allDone = level.appliances.every(
      (ap) => updated[levelId]?.[ap] !== undefined
    );
    if (allDone) {
      const allPassed = level.appliances.every(
        (ap) => updated[levelId][ap] > 3
      );
      setTimeout(() => {
        setFinalStatus(allPassed ? "win" : "lose");
        setShowFinal(true);

        // Notify Eco-verse parent window when level is won
        if (allPassed && window.opener) {
          const applianceScores = updated[levelId] || {};
          const scoreValues = Object.values(applianceScores);
          const avgScore = scoreValues.length > 0
            ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
            : 0;
          window.opener.postMessage(
            {
              type: "ECOVERSE_GAME_COMPLETE",
              gameId: "electricity-quiz",
              levelId,
              score: avgScore,
              passed: true,
            },
            "*"
          );
        }
      }, 500);
    }
  };

  const handleRetry = () => {
    // Clear scores for this level that didn't pass
    const updated = { ...progress };
    if (updated[levelId]) {
      const cleared = {};
      Object.entries(updated[levelId]).forEach(([ap, score]) => {
        if (score > 3) cleared[ap] = score; // keep passed ones
      });
      updated[levelId] = cleared;
      saveProgress(updated);
    }
    setShowFinal(false);
  };

  const completedCount = level?.appliances.filter((ap) => hasPassed(ap)).length || 0;

  if (!level) return null;

  return (
    <div className="w-screen h-screen relative overflow-hidden select-none">
      {/* Background image */}
      {level.image ? (
        <img
          src={level.image}
          alt={level.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        /* Fallback gradient background for rooms without images */
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2d5016 50%, #1a1a2e 100%)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/20">
              <div className="text-8xl mb-4">{level.icon}</div>
              <p className="text-2xl font-bold">{level.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex justify-end items-start p-4 gap-3">
          {/* Level info panel */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2.5 text-white pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{level.icon}</span>
              <span className="font-black text-sm">{level.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden w-24">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / level.appliances.length) * 100}%`,
                    background: "linear-gradient(90deg, #22c55e, #4ade80)",
                  }}
                />
              </div>
              <span className="text-xs text-gray-300 font-bold">
                {completedCount}/{level.appliances.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appliance Hotspots */}
      {level.appliances.map((applianceId) => {
        const spot = hotspots[applianceId];
        if (!spot) return null;

        const completed = isCompleted(applianceId);
        const score = getScore(applianceId);
        const insight = applianceInsights[applianceId];

        return (
          <div
            key={applianceId}
            style={{
              position: "absolute",
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
            }}
          >
            {/* Clickable hotspot */}
            <div
              onClick={() => openQuiz(applianceId)}
              onMouseEnter={() => setTooltip(applianceId)}
              onMouseLeave={() => setTooltip(null)}
              className={`w-full h-full rounded-lg transition-all duration-300 relative ${
                hasPassed(applianceId)
                  ? "cursor-default"
                  : "cursor-pointer hover:ring-4 hover:ring-yellow-400/70 glow-hotspot"
              }`}
              style={{
                background: !completed
                  ? "rgba(255,255,0,0.05)"
                  : score > 3
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(239,68,68,0.08)",
                border: !completed
                  ? "2px dashed rgba(250,204,21,0.6)"
                  : score > 3
                    ? "2px solid rgba(34,197,94,0.5)"
                    : "2px dashed rgba(239,68,68,0.7)",
              }}
            >
              {/* Score badge */}
              {completed && score !== null && (
                <ScoreBadge score={score} />
              )}

              {/* Tooltip */}
              {tooltip === applianceId && (
                <div
                  className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl animate-fadeIn pointer-events-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{insight?.icon}</span>
                    <span>{insight?.name || applianceId.replace("_", " ")}</span>
                    {completed && score > 3 && <span className="text-emerald-400">({score}/5) ✓</span>}
                    {completed && score <= 3 && <span className="text-red-400">({score}/5) – Retry!</span>}
                    {!completed && <span className="text-yellow-400">Click to quiz!</span>}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              )}

              {/* Lock/check overlay */}
              {completed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    score > 3 ? "bg-emerald-500/80" : "bg-red-500/80"
                  }`}>
                    {score > 3 ? "✓" : "↺"}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Appliance Legend Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center gap-4">
          {level.appliances.map((applianceId) => {
            const completed = isCompleted(applianceId);
            const score = getScore(applianceId);
            const insight = applianceInsights[applianceId];
            return (
              <div key={applianceId} className="flex items-center gap-1.5 text-white">
                <span className="text-lg">{insight?.icon || "⚡"}</span>
                <div>
                  <p className="text-xs font-bold leading-none">{insight?.name?.split(" ")[0]}</p>
                  <p className={`text-xs leading-none mt-0.5 font-black ${
                    !completed ? "text-yellow-400" : score > 3 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {!completed ? "●●●●●" : `${score}/5`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Modal */}
      {activeAppliance && (
        <QuizModal
          applianceId={activeAppliance}
          levelId={levelId}
          onClose={() => setActiveAppliance(null)}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Final Result */}
      {showFinal && (
        <FinalResultOverlay
          status={finalStatus}
          levelName={level.name}
          onClose={onGoHome}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
