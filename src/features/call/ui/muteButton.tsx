type MuteButtonProps = {
  isMuted: boolean;
  onClick: () => void;
};

export const MuteButton: React.FC<MuteButtonProps> = ({ isMuted, onClick }) => {
  return (
    <button
      type="button"
      aria-label={isMuted ? "Включить микрофон" : "Выключить микрофон"}
      aria-pressed={isMuted}
      onClick={onClick}
      className="flex w-24 flex-col items-center gap-1"
    >
      <span
        className="bg-accent-light text-primary flex h-9 w-9 items-center justify-center rounded-full"
        // style={{ background: "#E5E4F7", color: "#7769E1" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 14.5a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5.5a3 3 0 0 0 3 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18.5V22M8 22h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isMuted && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />}
        </svg>
      </span>
      <span className="text-xs text-white">{isMuted ? "Вкл. микрофон" : "Выкл. микрофон"}</span>
    </button>
  );
};
