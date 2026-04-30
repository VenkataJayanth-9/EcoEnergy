import { useState } from "react";
import Home from "./Pages/Home";
import RoomScene from "./Components/RoomScene";

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(null);

  return (
    <div className="relative w-screen min-h-screen">
      {currentLevel && (
        <button
          onClick={() => setCurrentLevel(null)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 font-bold text-sm border border-gray-200"
        >
          <span>🏠</span> Home
        </button>
      )}

      {!currentLevel && <Home onSelectLevel={setCurrentLevel} />}
      {currentLevel && (
        <RoomScene levelId={currentLevel} onGoHome={() => setCurrentLevel(null)} />
      )}
    </div>
  );
}
