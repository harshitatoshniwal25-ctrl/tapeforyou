import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// --- Firebase Cloud Storage Setup ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== "undefined")
    return JSON.parse(__firebase_config);
  return null;
};
const firebaseConfig = getFirebaseConfig();
let app, auth, db;
const appId = typeof __app_id !== "undefined" ? __app_id : "tape-for-you";

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- Cute Handdrawn-Style Icons ---
const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c-1.5 0-2.8 1.2-2.8 3.5v6c0 2 1.2 3.5 2.8 3.5s2.8-1.5 2.8-3.5v-6C14.8 3.2 13.5 2 12 2z" />
    <path d="M19 10v1.5c0 3.5-3 6.5-7 6.5s-7-3-7-6.5V10" />
    <path d="M12 18v4M9 22h6" />
  </svg>
);
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 5.5C7 4.5 8 4 8.8 4.5L18.5 11c.7.4.7 1.5 0 2L8.8 19.5C8 20 7 19.5 7 18.5V5.5Z" />
  </svg>
);
const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 6v12M15 6v12" strokeWidth="4" />
  </svg>
);
const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const PolaroidCameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
    <path d="M7 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
    <circle cx="12" cy="14" r="3"></circle>
  </svg>
);
const CrossIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Authentic Classic Cassette Icon
const ClassicCassetteIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="16"
    viewBox="0 0 24 16"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 0C0.89543 0 0 0.89543 0 2V14C0 15.1046 0.89543 16 2 16H22C23.1046 16 24 15.1046 24 14V2C24 0.89543 23.1046 0 22 0H2ZM4.5 3C4.22386 3 4 3.22386 4 3.5V8.5C4 8.77614 4.22386 9 4.5 9H19.5C19.7761 9 20 8.77614 20 8.5V3.5C20 3.22386 19.7761 3 19.5 3H4.5ZM7 7.5C7.82843 7.5 8.5 6.82843 8.5 6C8.5 5.17157 7.82843 4.5 7 4.5C6.17157 4.5 5.5 5.17157 5.5 6C5.5 6.82843 6.17157 7.5 7 7.5ZM18.5 6C18.5 6.82843 17.8284 7.5 17 7.5C16.1716 7.5 15.5 6.82843 15.5 6C15.5 5.17157 16.1716 4.5 17 4.5C17.8284 4.5 18.5 5.17157 18.5 6ZM7.5 11L9 14H15L16.5 11H7.5Z"
    />
  </svg>
);

// --- Voice Note Waveform Graphic ---
const StaticWaveform = () => (
  <div className="flex items-center justify-center gap-[3px] opacity-40 h-5">
    {[4, 6, 9, 14, 18, 12, 8, 16, 20, 14, 10, 18, 12, 8, 14, 9, 6, 4].map(
      (h, i) => (
        <div
          key={i}
          className="w-[3px] bg-[#5A4B48] rounded-full"
          style={{ height: `${h}px` }}
        ></div>
      )
    )}
  </div>
);

// --- Advanced 2D Flat Design Themes ---
const THEMES = [
  {
    id: "pop",
    name: "Pop Mix",
    body: "bg-[#FFD166]",
    label: "bg-[#EF476F]",
    bottom: "bg-[#118AB2]",
    text: "text-white",
  },
  {
    id: "sun",
    name: "Sunbeam",
    body: "bg-[#EF476F]",
    label: "bg-[#FFD166]",
    bottom: "bg-[#06D6A0]",
    text: "text-[#3A2A27]",
  },
  {
    id: "ocean",
    name: "Ocean",
    body: "bg-[#118AB2]",
    label: "bg-[#06D6A0]",
    bottom: "bg-[#FFD166]",
    text: "text-[#3A2A27]",
  },
  {
    id: "midnight",
    name: "Midnight",
    body: "bg-[#332A28]",
    label: "bg-[#DEB6B8]",
    bottom: "bg-[#221C1A]",
    text: "text-[#332A28]",
  },
  {
    id: "valentine",
    name: "Valentine",
    body: "bg-[#FFB6C1]",
    label: "bg-[#FFF]",
    bottom: "bg-[#FF69B4]",
    text: "text-[#332A28]",
  },
  {
    id: "vintage",
    name: "Vintage",
    body: "bg-[#D2C5A5]",
    label: "bg-[#FFF]",
    bottom: "bg-[#B0A385]",
    text: "text-[#332A28]",
  },
  {
    id: "royal",
    name: "Royal",
    body: "bg-[#251E33]",
    label: "bg-[#FF69B4]",
    bottom: "bg-[#181322]",
    text: "text-[#332A28]",
  },
  {
    id: "sunset",
    name: "Sunset",
    body: "bg-[#EFE3D3]",
    label: "bg-[#C73E3E]",
    bottom: "bg-[#D4C5B1]",
    text: "text-[#FFF]",
  },
];

// --- Audio Manager ---
class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.hissSource = null;
    this.gainNode = null;
  }
  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }
  startHiss() {
    this.init();
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
  }
  stopHiss() {}

  playClick() {
    this.init();
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.02);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }
}
const audioFX = new AudioManager();

// --- Main Standard CTA Button ---
const RetroCTA = ({
  onClick,
  children,
  color = "bg-[#FF69B4]",
  textColor = "text-white",
  className = "",
  disabled,
}) => (
  <button
    onClick={(e) => {
      if (disabled) return;
      audioFX.playClick();
      if (onClick) onClick(e);
    }}
    className={`relative group outline-none shrink-0 block transition-transform active:scale-95 select-none touch-manipulation ${className} ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
    style={{ WebkitTapHighlightColor: "transparent" }}
  >
    <div className="absolute inset-0 bg-[#3A2E2B] rounded-xl translate-y-[4px]"></div>
    <div
      className={`relative px-6 py-2 sm:px-8 sm:py-2.5 ${color} border-[3px] border-[#3A2E2B] rounded-xl flex items-center justify-center transition-transform duration-100 ease-out overflow-hidden shadow-[inset_2px_2px_0_rgba(255,255,255,0.4),inset_-3px_-3px_0_rgba(0,0,0,0.15)] ${
        disabled
          ? ""
          : "group-hover:translate-y-[1px] group-active:translate-y-[4px]"
      }`}
    >
      <span
        className={`relative font-handwriting text-xl sm:text-2xl font-bold tracking-wide flex items-center justify-center gap-2 ${textColor} z-10 lowercase`}
      >
        {children}
      </span>
    </div>
  </button>
);

// --- Main Application ---
export default function App() {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [tapeData, setTapeData] = useState({
    audioBlob: null,
    audioUrl: null,
    theme: THEMES[0],
    label: "",
    message: "",
    polaroid: { src: null, isVisible: true },
  });

  // Database Initialization & Link Checking
  useEffect(() => {
    if (!auth) {
      setIsAppLoading(false);
      return;
    }

    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadSharedTape = async () => {
      const params = new URLSearchParams(window.location.search);
      const tapeId = params.get("tape");

      if (tapeId && db) {
        try {
          const tapeRef = doc(
            db,
            "artifacts",
            appId,
            "public",
            "data",
            "tapes",
            tapeId
          );
          const tapeSnap = await getDoc(tapeRef);

          if (tapeSnap.exists()) {
            const data = tapeSnap.data();
            setTapeData({
              audioBlob: null,
              audioUrl: data.audioBase64,
              theme: data.theme || THEMES[0],
              label: data.label || "",
              message: data.message || "",
              polaroid: {
                src: data.polaroidSrc || null,
                isVisible: !!data.polaroidSrc,
              },
            });
            setStep(4);
          } else {
            setStep(4);
          }
        } catch (error) {
          console.error("Error fetching tape:", error);
          setStep(4);
        }
      }
      setIsAppLoading(false);
    };

    loadSharedTape();
  }, [user]);

  // Global Styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
      body { margin: 0; background-color: #F9F9F9; color: #4A3B32; font-family: 'Outfit', sans-serif; overflow-x: hidden; overflow-y: auto; -webkit-tap-highlight-color: transparent; }
      .font-handwriting { font-family: 'Caveat', cursive; }
      .font-sans { font-family: 'Outfit', sans-serif; }
      .bg-grain {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 50;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        opacity: 0.03;
      }
      .a4-paper {
        background-color: #FFFFFF;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
        box-shadow: 0 10px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.04);
      }
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .animate-spin-slow { animation: spin 4s linear infinite; }
      @keyframes develop {
        0% { filter: brightness(2) contrast(0.5) sepia(1); opacity: 0; }
        20% { opacity: 1; filter: brightness(1.5) contrast(0.8) sepia(0.8); }
        100% { filter: brightness(1) contrast(1) sepia(0.1); }
      }
      .animate-develop { animation: develop 3s ease-out forwards; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(58,46,43,0.15); border-radius: 10px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const updateTapeData = (key, value) =>
    setTapeData((prev) => ({ ...prev, [key]: value }));
  const resetTape = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setTapeData({
      audioBlob: null,
      audioUrl: null,
      theme: THEMES[0],
      label: "",
      message: "",
      polaroid: { src: null, isVisible: true },
    });
    setStep(0);
  };

  if (isAppLoading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F9F9F9]">
        <div className="w-16 h-16 opacity-50 animate-pulse">
          <ClassicCassetteIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-start overflow-x-hidden selection:bg-[#DEB6B8] selection:text-white">
      <div className="bg-grain"></div>

      {step !== 0 && step !== 4 && (
        <div
          className="fixed top-5 left-5 sm:top-8 sm:left-8 z-50 flex items-center cursor-pointer group p-2 -m-2"
          onClick={() => {
            audioFX.playClick();
            resetTape();
          }}
          title="Home"
        >
          <ClassicCassetteIcon className="w-8 h-auto sm:w-10 text-[#3A2E2B] group-hover:scale-105 transition-transform drop-shadow-sm" />
        </div>
      )}

      <div className="z-10 w-full flex-1 flex flex-col items-center relative px-6 sm:px-20 md:px-32 pt-10 sm:pt-14 pb-8 sm:pb-12">
        {step === 0 && (
          <StepHome tapeData={tapeData} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepRecord
            tapeData={tapeData}
            updateTapeData={updateTapeData}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepLetter
            tapeData={tapeData}
            updateTapeData={updateTapeData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepSend
            tapeData={tapeData}
            onReset={resetTape}
            onSimulateRecipient={() => setStep(4)}
            user={user}
          />
        )}
        {step === 4 && (
          <RecipientView tapeData={tapeData} onReset={resetTape} />
        )}
      </div>
    </div>
  );
}

// --- Cassette Component ---
const Cassette = ({
  theme,
  isSpinning,
  labelText = "",
  onLabelChange,
  isEditable = false,
  thumbnail = false,
}) => {
  const outerRadius = thumbnail ? "rounded-[8px]" : "rounded-[16px]";
  const innerRadius = thumbnail ? "rounded-[4px]" : "rounded-[8px]";
  const borderThick = thumbnail ? "border-2" : "border-[3.5px]";
  const borderThin = thumbnail ? "border-[1.5px]" : "border-[2.5px]";
  const shadowThick =
    "shadow-[inset_2px_2px_0_rgba(255,255,255,0.2),inset_-2px_-2px_0_rgba(0,0,0,0.1)]";

  return (
    <div
      className={`relative w-full aspect-[1.58/1] ${outerRadius} overflow-hidden ${borderThick} border-[#3A2E2B] ${theme.body} flex flex-col justify-start ${shadowThick} transition-colors duration-300`}
    >
      <div className="absolute top-[4%] left-[3%] w-[2.5%] aspect-square rounded-full bg-[#3A2E2B]/20 shadow-inner z-10"></div>
      <div className="absolute top-[4%] right-[3%] w-[2.5%] aspect-square rounded-full bg-[#3A2E2B]/20 shadow-inner z-10"></div>
      <div className="absolute bottom-[4%] left-[3%] w-[2.5%] aspect-square rounded-full bg-[#3A2E2B]/20 shadow-inner z-10"></div>
      <div className="absolute bottom-[4%] right-[3%] w-[2.5%] aspect-square rounded-full bg-[#3A2E2B]/20 shadow-inner z-10"></div>
      <div
        className={`absolute top-[10%] bottom-[12%] left-[8%] right-[8%] ${innerRadius} ${borderThin} border-[#3A2E2B] ${theme.label} flex flex-col items-center justify-start z-10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]`}
      >
        <div className="absolute top-0 left-0 right-0 h-[48%] z-20 px-4 sm:px-6 flex items-center justify-center">
          <input
            type="text"
            value={labelText}
            onChange={(e) => onLabelChange && onLabelChange(e.target.value)}
            placeholder="write here"
            maxLength={20}
            readOnly={!isEditable}
            className={`w-[90%] bg-transparent outline-none border-b-[2px] border-[#3A2E2B]/20 border-dashed text-center font-handwriting ${
              thumbnail ? "text-[8px] pt-1" : "text-xl sm:text-2xl pt-2"
            } ${theme.text} placeholder:text-current placeholder:opacity-50 ${
              !isEditable ? "pointer-events-none" : ""
            } transition-all`}
          />
        </div>
        <div
          className={`absolute top-[50%] bottom-[12%] left-[12%] right-[12%] bg-[#1A1615] rounded-sm overflow-hidden flex items-center justify-between px-[8%] ${borderThin} border-[#3A2E2B] z-10`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <div
            className={`w-[32%] aspect-square bg-[#E5E0D8] rounded-full flex items-center justify-center relative overflow-hidden border-[#3A2E2B] ${
              thumbnail ? "border-[1px]" : "border-[2px]"
            } ${isSpinning ? "animate-spin-slow" : ""}`}
          >
            <div className="absolute w-full h-[15%] bg-[#3A2E2B] rotate-0"></div>
            <div className="absolute w-full h-[15%] bg-[#3A2E2B] rotate-[60deg]"></div>
            <div className="absolute w-full h-[15%] bg-[#3A2E2B] rotate-[120deg]"></div>
            <div
              className={`w-[50%] aspect-square bg-[#E5E0D8] rounded-full z-10 flex items-center justify-center border-[#3A2E2B] ${
                thumbnail ? "border-[1px]" : "border-[2px]"
              }`}
            >
              <div className="w-[30%] aspect-square bg-[#3A2E2B] rounded-full"></div>
            </div>
          </div>
          <div
            className={`w-[32%] aspect-square bg-[#E5E0D8] rounded-full flex items-center justify-center relative overflow-hidden border-[#3A2E2B] ${
              thumbnail ? "border-[1px]" : "border-[2px]"
            } ${isSpinning ? "animate-spin-slow" : ""}`}
          >
            <div className="absolute w-full h-[15%] bg-[#3A2E2B] rotate-0"></div>
            <div className="absolute w-full h-[15%] bg-[#3A2E2B] rotate-[60deg]"></div>
            <div className="absolute w-full h-[15%] bg-[#3A2E2B] rotate-[120deg]"></div>
            <div
              className={`w-[50%] aspect-square bg-[#E5E0D8] rounded-full z-10 flex items-center justify-center border-[#3A2E2B] ${
                thumbnail ? "border-[1px]" : "border-[2px]"
              }`}
            >
              <div className="w-[30%] aspect-square bg-[#3A2E2B] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`absolute bottom-[-1px] left-[15%] right-[15%] h-[18%] ${theme.bottom} border-x-[3px] border-t-[3px] border-[#3A2E2B] rounded-t-[10px] sm:rounded-t-[14px] z-20 flex items-center justify-around px-[10%] overflow-hidden`}
      >
        <div className="absolute top-0 left-0 right-0 h-[30%] bg-white/20 pointer-events-none"></div>
        <div
          className={`w-[10%] aspect-square rounded-full bg-[#3A2E2B] opacity-80 shadow-sm`}
        ></div>
        <div
          className={`w-[10%] aspect-square rounded-full bg-[#3A2E2B] opacity-80 shadow-sm`}
        ></div>
      </div>
    </div>
  );
};

// --- Step 0: Landing ---
const StepHome = ({ tapeData, onNext }) => (
  <div className="w-full flex-1 flex flex-col items-center justify-center fade-in">
    <div
      className="w-full flex items-center justify-center hover:scale-105 transition-transform duration-500 cursor-pointer z-20 drop-shadow-2xl"
      style={{ maxWidth: "min(90%, 380px)" }}
      onClick={() => onNext()}
    >
      <Cassette
        theme={tapeData.theme}
        isSpinning={true}
        labelText="tape for you"
      />
    </div>
    <div className="mt-8 text-center flex flex-col items-center gap-2">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-[#3A2A27] font-handwriting lowercase drop-shadow-sm">
        tape for you
      </h1>
      <p className="text-sm opacity-80 font-sans font-semibold tracking-[0.15em] lowercase text-[#3A2A27]">
        send a voice note with a message
      </p>
    </div>
    <div className="mt-8 shrink-0">
      <RetroCTA onClick={onNext} color="bg-[#FF69B4]" textColor="text-white">
        make a tape <MicIcon />
      </RetroCTA>
    </div>
  </div>
);

// --- Step 1: Record ---
const StepRecord = ({ tapeData, updateTapeData, onNext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showLabelAlert, setShowLabelAlert] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    audioRef.current.onended = () => {
      setIsPlaying(false);
      audioFX.stopHiss();
    };
    return () => {
      clearInterval(timerRef.current);
      audioRef.current.pause();
      audioFX.stopHiss();
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const startRecording = async () => {
    // Mobile safety check: Ensure browser supports recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Your browser or app (like Instagram/TikTok) is blocking the microphone. Please open this link directly in Safari or Chrome to record!"
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        updateTapeData("audioBlob", audioBlob);
        updateTapeData("audioUrl", audioUrl);
        audioRef.current.src = audioUrl;
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (
            prev >= 59 &&
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
          ) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert(
        "Microphone access is needed to record. Please check your phone settings."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
      audioFX.stopHiss();
      setIsPlaying(false);
    } else {
      audioFX.startHiss();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!tapeData.label.trim()) setShowLabelAlert(true);
    else onNext();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-start items-center fade-in">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-handwriting text-[#3A2A27] mb-8 sm:mb-16 font-bold tracking-wide text-center lowercase shrink-0">
        record something sweet
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-start md:justify-center w-full gap-8 md:gap-14 max-w-[800px] flex-1 pb-8 md:pb-0">
        <div className="flex flex-col items-center justify-start w-full md:w-1/2 shrink-0 max-w-[340px]">
          <div className="w-full z-20 mb-6 transition-transform duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)] rounded-xl">
            <Cassette
              theme={tapeData.theme}
              isSpinning={isRecording || isPlaying}
              labelText={tapeData.label}
              onLabelChange={(val) => updateTapeData("label", val)}
              isEditable={true}
            />
          </div>
          <div className="w-full h-10 sm:h-12 bg-[#1A1615] rounded-md shadow-lg flex items-center justify-center px-6 relative overflow-hidden mb-6 border-[2px] border-[#3A2E2B]">
            {!tapeData.audioUrl ? (
              <div className="w-full flex items-center justify-center">
                {isRecording ? (
                  <span className="font-sans text-sm lowercase tracking-[0.3em] font-bold text-[#FF69B4] animate-pulse">
                    rec {formatTime(recordingTime)}/1:00
                  </span>
                ) : (
                  <StaticWaveform />
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-between text-[#FF69B4]">
                <button
                  onClick={() => {
                    audioFX.playClick();
                    updateTapeData("audioUrl", null);
                    updateTapeData("audioBlob", null);
                  }}
                  className="hover:text-white transition-colors p-2 -m-2"
                  title="delete"
                >
                  <RefreshIcon />
                </button>
                <button
                  onClick={() => {
                    audioFX.playClick();
                    togglePlayback();
                  }}
                  className="text-white hover:scale-110 transition-transform p-2 -m-2"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div className="font-sans text-sm tracking-widest">
                  {formatTime(recordingTime)}
                </div>
              </div>
            )}
          </div>
          {!tapeData.audioUrl && (
            <button
              onClick={() => {
                audioFX.playClick();
                isRecording ? stopRecording() : startRecording();
              }}
              className="w-14 h-14 rounded-full border-[3px] border-[#3A2E2B] bg-[#E5E0D8] shadow-[4px_4px_0_rgba(58,46,43,1)] flex items-center justify-center hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(58,46,43,1)] transition-all group shrink-0"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div
                className={`transition-all duration-300 ${
                  isRecording
                    ? "w-4 h-4 bg-[#FF1493] rounded-sm"
                    : "w-5 h-5 bg-[#FF1493] rounded-full group-hover:bg-[#D1005A]"
                }`}
              ></div>
            </button>
          )}
          {tapeData.audioUrl && (
            <RetroCTA onClick={handleNext}>next &rarr;</RetroCTA>
          )}
        </div>

        <div className="flex flex-col items-center justify-start w-full md:w-1/2 shrink-0 max-w-[380px]">
          <p className="font-sans text-[#A2938F] lowercase text-lg mb-4 tracking-wide text-center">
            pick a vibe
          </p>
          <div className="grid grid-cols-3 gap-3 w-full">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  audioFX.playClick();
                  updateTapeData("theme", theme);
                }}
                className={`relative aspect-square flex flex-col items-center justify-center p-2 sm:p-3 rounded-md transition-all duration-200 overflow-hidden ${
                  tapeData.theme.id === theme.id
                    ? "bg-[#FFF0F5] shadow-inner border-[2px] border-[#FF69B4] scale-105"
                    : "bg-[#FCFBF8] border-[2px] border-black/5 shadow-sm hover:bg-[#FFF0F5] hover:border-[#FFB6C1] hover:scale-105"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <div className="w-[90%] flex items-center justify-center pointer-events-none drop-shadow-sm">
                  <Cassette theme={theme} thumbnail={true} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showLabelAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F9F9F9]/90 backdrop-blur-sm p-4 fade-in">
          <div className="bg-[#FCFBF8] border-[3px] border-[#3A2E2B] rounded-xl p-8 max-w-sm w-full shadow-[8px_8px_0_rgba(58,46,43,1)] flex flex-col items-center text-center">
            <h2 className="font-handwriting text-4xl text-[#3A2A27] font-bold mb-4 mt-2 lowercase">
              wait a sec!
            </h2>
            <p className="font-sans text-[#A2938F] text-sm font-bold tracking-wide lowercase mb-8">
              please write something on the cassette to make it personal
            </p>
            <RetroCTA
              onClick={() => setShowLabelAlert(false)}
              color="bg-[#118AB2]"
            >
              ok
            </RetroCTA>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Step 2: Letter ---
const StepLetter = ({ tapeData, updateTapeData, onNext, onBack }) => {
  return (
    <div className="w-full flex-1 flex flex-col justify-start items-center fade-in min-h-0 pt-2 sm:pt-0">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-handwriting text-[#3A2A27] mb-6 sm:mb-8 font-bold tracking-wide text-center lowercase shrink-0">
        write a note
      </h1>

      <div className="w-full flex-1 min-h-0 flex flex-col items-center max-w-[700px]">
        <div className="w-full flex-1 min-h-[300px] a4-paper relative z-20 flex flex-col overflow-hidden mb-4 sm:mb-8 rounded-md shadow-sm">
          <textarea
            value={tapeData.message}
            onChange={(e) => updateTapeData("message", e.target.value)}
            placeholder="write your message here..."
            className="flex-1 w-full h-full bg-transparent resize-none outline-none font-sans text-sm sm:text-base text-[#3A2A27] z-10 p-6 sm:p-12 leading-relaxed placeholder:opacity-40"
            spellCheck="false"
            style={
              tapeData.polaroid.isVisible
                ? { paddingRight: "clamp(110px, 35%, 160px)" }
                : {}
            }
          />
          <FixedPolaroid
            polaroid={tapeData.polaroid}
            updatePolaroid={(upd) =>
              updateTapeData("polaroid", { ...tapeData.polaroid, ...upd })
            }
            isEditable={true}
          />
        </div>

        <div className="flex flex-col items-center gap-3 shrink-0 pb-2">
          {!tapeData.polaroid.isVisible && (
            <button
              onClick={() => {
                audioFX.playClick();
                updateTapeData("polaroid", {
                  ...tapeData.polaroid,
                  isVisible: true,
                });
              }}
              className="text-[#A2938F] text-xs lowercase tracking-widest font-bold hover:text-[#FF1493] transition-colors font-sans mb-1 p-2 -m-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              + add polaroid
            </button>
          )}
          <RetroCTA onClick={onNext}>ready &rarr;</RetroCTA>
          <button
            onClick={() => {
              audioFX.playClick();
              onBack();
            }}
            className="text-[#A2938F] text-[10px] lowercase tracking-widest font-bold hover:text-[#3A2E2B] transition-colors font-sans mt-1 p-2 -m-2"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            back to tape
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Fixed Polaroid Component ---
const FixedPolaroid = ({ polaroid, updatePolaroid, isEditable }) => {
  const internalFileRef = useRef(null);

  if (!polaroid.isVisible) return null;
  if (!isEditable && !polaroid.src) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          let scale = MAX_WIDTH / img.width;
          if (scale > 1) scale = 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          updatePolaroid({
            src: canvas.toDataURL("image/jpeg", 0.8),
            isVisible: true,
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 group -rotate-[4deg]">
      {isEditable && (
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={internalFileRef}
          onChange={handleFile}
        />
      )}

      {isEditable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            audioFX.playClick();
            updatePolaroid({ isVisible: false });
          }}
          className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 bg-[#3A2E2B] rounded-full text-white flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-40 shadow-md hover:scale-110 active:scale-95"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <CrossIcon />
        </button>
      )}

      <div className="w-[110px] sm:w-[150px] bg-[#FFFFFF] p-2 pb-8 sm:p-3 sm:pb-12 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] border-[1px] border-black/5 flex flex-col items-center rounded-sm">
        {!polaroid.src ? (
          <div
            className="w-full aspect-square bg-[#F6F4F0] border-[2px] border-dashed border-[#D5CEC4] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F0EBE1] transition-colors rounded-sm"
            onClick={() => {
              audioFX.playClick();
              internalFileRef.current?.click();
            }}
          >
            <div className="text-[#988C86] w-6 h-6 sm:w-8 sm:h-8 mb-1">
              <PolaroidCameraIcon />
            </div>
            <span className="text-[10px] sm:text-[12px] lowercase tracking-wider font-bold font-sans text-[#988C86]">
              upload
            </span>
          </div>
        ) : (
          <div
            className={`w-full aspect-square bg-[#ececec] shadow-inner rounded-sm overflow-hidden ${
              isEditable ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (isEditable) {
                audioFX.playClick();
                internalFileRef.current?.click();
              }
            }}
          >
            <img
              src={polaroid.src}
              className="w-full h-full object-cover animate-develop rounded-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Step 3: Send (Saving to Cloud) ---
const StepSend = ({ tapeData, onReset, onSimulateRecipient, user }) => {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isSaving, setIsSaving] = useState(true);

  useEffect(() => {
    const saveToCloud = async () => {
      if (!user || !db) {
        setIsSaving(false);
        return;
      }
      try {
        const tapeId = crypto.randomUUID().split("-")[0];

        const audioBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(tapeData.audioBlob);
        });

        const tapeRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "tapes",
          tapeId
        );
        await setDoc(tapeRef, {
          theme: tapeData.theme,
          label: tapeData.label,
          message: tapeData.message,
          polaroidSrc: tapeData.polaroid.src || null,
          audioBase64: audioBase64,
          createdAt: new Date().toISOString(),
        });

        const domain = window.location.origin;
        setShareLink(`${domain}/?tape=${tapeId}`);
      } catch (err) {
        console.error("Error saving tape:", err);
        setShareLink(`${window.location.origin}/?tape=error`);
      } finally {
        setIsSaving(false);
      }
    };
    saveToCloud();
  }, [user]);

  const handleCopy = async () => {
    if (isSaving) return;
    audioFX.playClick();

    try {
      // Modern secure clipboard API (works best on Mobile Safari/Chrome)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareLink;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onSimulateRecipient();
      }, 1000);
    } catch (err) {
      alert(
        "Couldn't copy automatically. Please select the link and copy it manually!"
      );
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative fade-in">
      <h1 className="text-5xl font-handwriting text-[#3A2A27] mb-2 font-bold lowercase">
        send it
      </h1>
      <p className="text-[#A2938F] text-sm mb-12 font-sans font-bold tracking-widest lowercase text-center">
        {isSaving ? "uploading to the cloud..." : "your digital tape is ready"}
      </p>
      <div className="flex flex-col items-center w-full max-w-sm">
        <div
          className={`w-full bg-[#FCFBF8] p-2.5 sm:p-3 rounded-xl flex items-center justify-between border-[3px] border-[#3A2E2B] shadow-[4px_4px_0_rgba(58,46,43,1)] mb-12 gap-3 transition-opacity ${
            isSaving ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          <span className="truncate text-xs sm:text-sm font-bold text-[#3A2A27] pl-2 font-sans tracking-widest lowercase select-all">
            {isSaving ? "generating link..." : shareLink}
          </span>
          <button
            onClick={handleCopy}
            disabled={isSaving}
            className="relative group outline-none shrink-0 block transition-transform active:scale-95 touch-manipulation"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="absolute inset-0 bg-[#3A2E2B] rounded-lg translate-y-[3px]"></div>
            <div
              className={`relative px-4 py-1.5 bg-[#FF69B4] border-[2px] border-[#3A2E2B] rounded-lg flex items-center justify-center transition-colors duration-200 ease-out overflow-hidden shadow-[inset_1px_1px_0_rgba(255,255,255,0.4),inset_-1px_-1px_0_rgba(0,0,0,0.15)] group-hover:translate-y-[1px] group-active:translate-y-[3px]`}
            >
              <span className="relative font-handwriting text-lg sm:text-xl font-bold tracking-wide text-white z-10 lowercase">
                {copied ? "copied!" : "copy"}
              </span>
            </div>
          </button>
        </div>
        <button
          onClick={() => {
            audioFX.playClick();
            onSimulateRecipient();
          }}
          className={`text-[#3A2A27] font-sans font-bold lowercase tracking-widest text-xs hover:text-[#FF1493] transition-colors p-2 -m-2 ${
            isSaving ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          simulate view &rarr;
        </button>
      </div>
    </div>
  );
};

// --- Full CSS Retro Boombox Component ---
const RetroBoombox = ({ tapeData, isPlaying, isDropping, togglePlayback }) => (
  <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center fade-in max-w-[500px] pb-4 scale-95 sm:scale-100">
    <div className="relative w-full flex flex-col items-center">
      <div className="absolute -top-6 sm:-top-10 left-[15%] right-[15%] h-12 sm:h-16 border-[6px] sm:border-[8px] border-[#3A2E2B] rounded-t-3xl z-0"></div>
      <div className="relative w-full bg-[#DD4A38] border-[6px] sm:border-[8px] border-[#3A2E2B] rounded-2xl sm:rounded-[32px] p-4 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 z-10 shadow-[8px_16px_0_rgba(58,46,43,1)]">
        <div className="w-full sm:w-1/2 flex flex-col items-center">
          <div className="w-full aspect-[1.58/1] bg-[#1A1615] rounded-xl border-[4px] sm:border-[6px] border-[#3A2E2B] shadow-inner overflow-hidden relative flex items-center justify-center">
            <div
              className={`absolute w-[90%] transition-transform duration-[1200ms] ease-out ${
                !isDropping ? "translate-y-[-180%]" : "translate-y-0"
              }`}
            >
              <Cassette
                theme={tapeData.theme}
                isSpinning={isPlaying}
                labelText={tapeData.label}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none z-20"></div>
          </div>
          <div className="mt-6 sm:mt-8 w-[130px] sm:w-[150px] bg-[#2a211f] rounded-full p-1 sm:p-1.5 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center mx-auto border-[2px] border-[#3A2E2B]">
            <button
              onClick={togglePlayback}
              className="w-full bg-[#1A1615] rounded-full py-2 flex items-center justify-center gap-2 hover:bg-[#231d1c] active:scale-95 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-black touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="font-handwriting text-xl sm:text-2xl text-white tracking-widest lowercase pt-1">
                {isPlaying ? "pause" : "play"}
              </span>
              <div className="text-white scale-90">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </div>
            </button>
          </div>
        </div>
        <div className="w-[60%] sm:w-1/2 aspect-square bg-[#2B1D1B] rounded-full border-[6px] sm:border-[8px] border-[#3A2E2B] flex items-center justify-center relative overflow-hidden shadow-inner hidden sm:flex">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 opacity-30"
          >
            <pattern
              id="hex"
              x="0"
              y="0"
              width="16"
              height="26"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M8 0 L16 7 L16 19 L8 26 L0 19 L0 7 Z"
                fill="none"
                stroke="#E5E0D8"
                strokeWidth="2"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
          <div
            className={`w-[35%] aspect-square bg-[#111] rounded-full border-[4px] border-[#000] shadow-[0_0_20px_rgba(0,0,0,1)] transition-transform duration-100 ${
              isPlaying ? "scale-110" : "scale-100"
            }`}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// --- Step 4: Recipient View (Multi-Phase) ---
const RecipientView = ({ tapeData, onReset }) => {
  if (!tapeData.audioUrl && !tapeData.message && !tapeData.polaroid.src) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center fade-in text-center px-6 relative z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#3A2E2B] text-white rounded-xl flex items-center justify-center shadow-md mb-6 opacity-50">
          <ClassicCassetteIcon className="w-10 h-auto sm:w-12 drop-shadow-sm" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-handwriting text-[#3A2A27] mb-4 font-bold lowercase">
          tape missing
        </h1>
        <p className="text-[#A2938F] text-sm sm:text-base mb-8 font-sans font-bold tracking-wide lowercase max-w-sm">
          we couldn't find a tape at this link. it might have been deleted or
          the link is broken.
        </p>
        <RetroCTA
          onClick={() => (window.location.href = window.location.origin)}
          color="bg-[#118AB2]"
        >
          make your own tape
        </RetroCTA>
      </div>
    );
  }

  const hasLetterContent =
    tapeData.message.trim() !== "" ||
    (tapeData.polaroid.isVisible && tapeData.polaroid.src);
  const [phase, setPhase] = useState(hasLetterContent ? "letter" : "radio");
  const [isDropping, setIsDropping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(tapeData.audioUrl));

  useEffect(() => {
    if (!hasLetterContent) {
      setTimeout(() => setIsDropping(true), 150);
    }
    const handleEnded = () => {
      setIsPlaying(false);
      audioFX.stopHiss();
    };
    const audio = audioRef.current;
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audioFX.stopHiss();
    };
  }, [hasLetterContent]);

  const goToRadio = () => {
    audioFX.playClick();
    setPhase("radio");
    setTimeout(() => setIsDropping(true), 150);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
      audioFX.stopHiss();
      setIsPlaying(false);
    } else {
      audioFX.playClick();
      audioFX.startHiss();
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start relative fade-in min-h-0 pt-6 sm:pt-4">
      <div
        className="fixed top-5 left-5 sm:top-8 sm:left-8 z-50 flex flex-col items-center gap-1 cursor-pointer group p-2 -m-2"
        onClick={() => {
          audioFX.playClick();
          if (phase === "radio" && hasLetterContent) {
            setPhase("letter");
          } else {
            onReset();
          }
        }}
        title={
          phase === "radio" && hasLetterContent
            ? "Read the note"
            : "Make your own tape"
        }
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <ClassicCassetteIcon className="w-8 h-auto sm:w-10 text-[#3A2E2B] group-hover:scale-105 transition-transform drop-shadow-sm" />
        {phase === "radio" && hasLetterContent && (
          <span className="font-sans font-bold text-[9px] sm:text-[10px] tracking-widest text-[#3A2E2B] group-hover:text-[#FF1493] transition-colors lowercase mt-0.5">
            read note
          </span>
        )}
      </div>

      {phase === "letter" && hasLetterContent && (
        <div className="w-full h-full flex flex-col items-center justify-start flex-1 min-h-0">
          <div className="w-full flex-1 min-h-0 flex flex-col items-center max-w-[800px] relative">
            <div className="w-full flex-1 min-h-[300px] a4-paper relative z-20 flex flex-col overflow-hidden mb-4 sm:mb-6 rounded-md shadow-sm">
              <div
                className="flex-1 w-full font-sans text-sm sm:text-base text-[#3A2A27] z-10 p-6 sm:p-12 leading-relaxed whitespace-pre-wrap break-words overflow-y-auto"
                style={
                  tapeData.polaroid.isVisible && tapeData.polaroid.src
                    ? { paddingRight: "clamp(110px, 35%, 160px)" }
                    : {}
                }
              >
                {tapeData.message}
              </div>
              <FixedPolaroid polaroid={tapeData.polaroid} isEditable={false} />
            </div>
          </div>

          <div className="shrink-0 mb-4 sm:mb-6">
            <RetroCTA
              onClick={goToRadio}
              color="bg-[#FF69B4]"
              textColor="text-white"
            >
              go listen to the cassette &rarr;
            </RetroCTA>
          </div>
        </div>
      )}

      {phase === "radio" && (
        <RetroBoombox
          tapeData={tapeData}
          isPlaying={isPlaying}
          isDropping={isDropping}
          togglePlayback={togglePlayback}
        />
      )}
    </div>
  );
};
