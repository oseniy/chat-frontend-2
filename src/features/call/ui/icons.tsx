export const MicIcon = ({ muted }: { muted: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 14.5a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5.5a3 3 0 0 0 3 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18.5V22M8 22h8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {muted && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" />}
  </svg>
);

export const HangupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 11.5c4.5-4.5 13.5-4.5 18 0v3l-3 1-1-3a11.5 11.5 0 0 0-10 0l-1 3-3-1v-3Z"
      fill="currentColor"
      transform="rotate(135 12 12)"
    />
  </svg>
);

export const AcceptIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 11.5c4.5-4.5 13.5-4.5 18 0v3l-3 1-1-3a11.5 11.5 0 0 0-10 0l-1 3-3-1v-3Z"
      fill="currentColor"
    />
  </svg>
);
