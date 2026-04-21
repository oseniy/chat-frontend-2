export const AUTO_READ_CONFIG = {
  BATCH_DELAY: 150,
  READ_THRESHOLD: 0.1,
  READ_ROOT_MARGIN: "50px",
  SCROLL_BEHAVIOR: "auto" as const,
  TOP_OFFSET: 16,
};

export const FILE_ACCEPT = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "text/plain",
  "text/csv",

  ".md",

  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".htm",

  ".php",
  ".py",
  ".rb",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".cs",
  ".go",
  ".rs",
  ".swift",
  ".kt",

  ".sh",
  ".bash",
  ".zsh",

  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",

  "application/octet-stream",
];

export const BLOCKED_EXTENSIONS = [
  ".exe",
  ".msi",
  ".bat",
  ".cmd",
  ".com",
  ".scr",
  ".ps1",
  ".vbs",
  ".vbe",
  ".jsb",
  ".jar",
  ".app",
];
