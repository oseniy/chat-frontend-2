"use client";

import { useEffect, useState } from "react";

export const useFileSize = (url: string) => {
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  return { fileSize, isLoading, error };

  useEffect(() => {
    const fetchFileSize = async () => {
      if (!url) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(url, { method: "HEAD" });
        const size = response.headers.get("content-length");
        setFileSize(size ? parseInt(size, 10) : null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch file size"));
        console.error("Не удалось получить размер:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileSize();
  }, [url]);

  return { fileSize, isLoading, error };
};
