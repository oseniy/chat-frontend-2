import { useCallback, useEffect, useRef, useState } from "react";

export const useVoiceRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isRecording) return;

    const id = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRecording]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setDuration(0);
      setIsRecording(true);
    } catch (e) {
      console.error("Запрещен доступ к микрофону", e);
    }
  }, []);

  const stop = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return;

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((t) => t.stop());

        setIsRecording(false);
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  const cancel = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
    setIsRecording(false);
    setDuration(0);
  }, []);

  return {
    isRecording,
    duration,
    start,
    stop,
    cancel,
  };
};
