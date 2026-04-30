import { useState, useEffect } from "react";
import { applianceInsights, getRandomQuestions } from "../assets/assets";

const TOTAL_QUESTIONS = 5;
const PASS_SCORE = 3;

function InsightTab({ data, label }) {
  return (
    <div className="space-y-1.5">
      {data.map((item, i) => (
        <div key={i} className="flex gap-2 text-sm text-gray-700">
          <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function QuizModal({ applianceId, levelId, onClose, onComplete }) {
  const [quiz] = useState(() => getRandomQuestions(TOTAL_QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedThisQ, setSelectedThisQ] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [insightTab, setInsightTab] = useState("power");

  const insight = applianceInsights[applianceId] || {};
  const currentQ = quiz[currentIndex];

  const playSound = (type) => {
    try {
      const src = type === "success" ? "/CorrectAnswer.mp3" : "/WrongAnswer.mp3";
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 1500);
    } catch {}
  };

  const handleSelect = (opt) => {
    if (selectedThisQ !== null || showFeedback) return;
    setSelectedThisQ(opt);
    setShowFeedback(true);
    const isCorrect = opt === currentQ.answer;
    playSound(isCorrect ? "success" : "fail");
  };

  const handleNext = () => {
    const newAnswers = { ...answers, [currentIndex]: selectedThisQ };
    setAnswers(newAnswers);
    setSelectedThisQ(null);
    setShowFeedback(false);

    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score
      const score = quiz.reduce((acc, q, i) => {
        return acc + (newAnswers[i] === q.answer ? 1 : 0);
      }, 0);
      setAnswers(newAnswers);
      setShowResult(true);
      setTimeout(() => {
        const finalScore = score;
        if (finalScore > PASS_SCORE) {
          try {
            const audio = new Audio("/QuizCompletion.mp3");
            audio.volume = 0.6;
            audio.play().catch(() => {});
          } catch {}
        } else {
          try {
            const audio = new Audio("/QuizFail.mp3");
            audio.volume = 0.6;
            audio.play().catch(() => {});
          } catch {}
        }
      }, 100);
    }
  };

  const finalScore = quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  const passed = finalScore > PASS_SCORE;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a5f, #0f4c2a)" }}
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #4ade80 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{insight.icon || "⚡"}</span>
              <div>
                <h2 className="font-black text-lg leading-tight">{insight.name || applianceId}</h2>
                <p className="text-emerald-300 text-xs">{insight.wattage}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {!showResult ? (
            <div className="p-5">
              {/* Progress */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-gray-500 font-mono">
                  {currentIndex + 1}/{quiz.length}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentIndex) / quiz.length) * 100}%`,
                      background: "linear-gradient(90deg, #22c55e, #4ade80)",
                    }}
                  />
                </div>
                <div className="flex gap-1">
                  {quiz.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < currentIndex
                          ? answers[i] === quiz[i].answer ? "bg-emerald-500" : "bg-red-400"
                          : i === currentIndex ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                <p className="font-bold text-gray-800 text-base leading-snug">
                  {currentQ?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-4">
                {currentQ?.options.map((opt, i) => {
                  const isSelected = selectedThisQ === opt;
                  const isCorrect = opt === currentQ.answer;
                  let bg = "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                  if (showFeedback) {
                    if (isCorrect) bg = "bg-emerald-50 border-emerald-400";
                    else if (isSelected) bg = "bg-red-50 border-red-400";
                    else bg = "bg-white border-gray-100 opacity-50";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      disabled={showFeedback}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold text-sm text-gray-700 flex items-center justify-between ${bg}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 flex-shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </span>
                      {showFeedback && isCorrect && <span className="text-emerald-500">✓</span>}
                      {showFeedback && isSelected && !isCorrect && <span className="text-red-500">✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Feedback message */}
              {showFeedback && (
                <div className={`rounded-xl p-3 mb-4 text-sm font-semibold animate-fadeIn ${
                  selectedThisQ === currentQ.answer
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {selectedThisQ === currentQ.answer
                    ? "🎉 Correct! Well done!"
                    : `❌ Incorrect. The answer is: "${currentQ.answer}"`}
                </div>
              )}

              {/* Next button */}
              <button
                onClick={handleNext}
                disabled={!showFeedback}
                className={`w-full py-3 rounded-xl font-black text-white text-sm transition-all duration-200 ${
                  showFeedback
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {currentIndex < quiz.length - 1 ? "Next Question →" : "See Results"}
              </button>
            </div>
          ) : (
            /* Results Screen */
            <div className="p-5">
              <div className={`rounded-2xl p-5 text-center mb-5 animate-bounce-in ${
                passed ? "bg-emerald-50 border-2 border-emerald-200" : "bg-red-50 border-2 border-red-200"
              }`}>
                <div className="text-5xl mb-2">{passed ? "🎉" : "😔"}</div>
                <h3 className={`text-2xl font-black mb-1 ${passed ? "text-emerald-700" : "text-red-600"}`}>
                  {passed ? "Excellent!" : "Keep Learning!"}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-black text-gray-800">{finalScore}</span>
                  <span className="text-gray-400 font-semibold">/ {quiz.length}</span>
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: quiz.length }).map((_, i) => (
                    <span key={i} className={`text-xl ${i < finalScore ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
                <p className={`text-sm font-semibold ${passed ? "text-emerald-600" : "text-red-500"}`}>
                  {passed ? "You passed! Appliance mastered ✓" : `Need ${PASS_SCORE + 1}+ to pass. Try again!`}
                </p>
              </div>

              {/* Energy Tip */}
              <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">💡 Energy Tip</p>
                <p className="text-sm text-amber-900">{insight.tip}</p>
              </div>

              {/* Appliance Insights */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden mb-4">
                <div className="flex border-b border-gray-100">
                  {["power", "accidents", "disadvantages"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInsightTab(tab)}
                      className={`flex-1 py-2 text-xs font-bold capitalize transition-colors ${
                        insightTab === tab ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {tab === "power" ? "⚡ Power" : tab === "accidents" ? "⚠️ Safety" : "📉 Drawbacks"}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  <InsightTab data={insight[insightTab] || []} label={insightTab} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => onComplete(finalScore)}
                  className={`flex-2 flex-grow py-3 rounded-xl font-black text-white text-sm transition-all shadow-lg ${
                    passed
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  {passed ? "✓ Save Score" : "Save & Return"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
