type HangupButtonProps = {
  onClick: () => void;
};

export const HangupButton: React.FC<HangupButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      aria-label="Завершить звонок"
      onClick={onClick}
      className="flex w-17 flex-col items-center gap-1"
    >
      <span className="bg-error flex h-9 w-9 items-center justify-center rounded-full text-white">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-xs text-white">Завершить</span>
    </button>
  );
};
