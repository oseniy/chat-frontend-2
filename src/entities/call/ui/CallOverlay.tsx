"use client";
import { useEffect, useRef, useState } from "react";

import { useCallStore } from "../model/useCallStore";

export const CallOverlay = () => {
  const {
    localStream,
    remoteStream,
    callStatus,
    isVideoEnabled,
    toggleVideo,
    acceptCall,
    endCall,
  } = useCallStore();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null); // Реф для чистого звука
  const [volume, setVolume] = useState(0); // Состояние для визуализации

  useEffect(() => {
    if (!remoteStream || remoteStream.getAudioTracks().length === 0) return;

    // Исправляем именование на camelCase и убираем any
    const audioContextConstructor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    const ctx = new audioContextConstructor();

    const resumeAudio = async () => {
      if (ctx.state === "suspended") {
        await ctx.resume();
        console.warn("🔊 AudioContext разблокирован!");
      }
    };

    window.addEventListener("click", resumeAudio);

    const source = ctx.createMediaStreamSource(remoteStream);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      if (callStatus === "idle") return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

      if (avg > 5) {
        setVolume(avg);
      }
      requestAnimationFrame(update);
    };
    update();

    return () => {
      window.removeEventListener("click", resumeAudio);
      void ctx.close(); // Используем void для промиса close
    };
  }, [remoteStream, callStatus]);

  if (callStatus === "idle") return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-slate-950/95 text-white">
      {/* Скрытый аудио-тег для гарантированного вывода звука */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* ВХОДЯЩИЙ ВЫЗОВ */}
      {callStatus === "ringing" && !localStream && (
        <div className="flex flex-col items-center gap-8 rounded-[40px] border border-white/10 bg-slate-900 p-12 shadow-2xl">
          <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-blue-500 text-4xl">
            📞
          </div>
          <h2 className="text-center text-3xl font-bold">Голосовой вызов</h2>
          <div className="flex gap-4">
            <button
              onClick={acceptCall}
              className="rounded-full bg-green-500 px-10 py-4 text-xl font-bold transition-transform active:scale-95"
            >
              Принять
            </button>
            <button
              onClick={() => endCall(true)}
              className="rounded-full bg-red-500 px-10 py-4 text-xl font-bold transition-transform active:scale-95"
            >
              Отклонить
            </button>
          </div>
        </div>
      )}

      {/* ЭКРАН РАЗГОВОРА */}
      {(callStatus === "calling" ||
        callStatus === "connected" ||
        (callStatus === "ringing" && localStream)) && (
        <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900 shadow-2xl">
            {/* Видео собеседника или заглушка с индикатором звука */}
            {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
              <video ref={remoteRef} autoPlay playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-800 text-slate-500">
                <div
                  className={`flex h-32 w-32 items-center justify-center rounded-full bg-slate-700 transition-all duration-75 ${volume > 10 ? "scale-110 border-4 border-blue-500" : "scale-100"}`}
                >
                  <span className="text-6xl">👤</span>
                </div>
                {volume > 10 && (
                  <p className="animate-pulse text-blue-400">Собеседник говорит...</p>
                )}
              </div>
            )}

            {/* Ваше видео (маленькое) */}
            <div className="absolute right-6 bottom-6 z-10 aspect-video w-1/4 overflow-hidden rounded-2xl border border-white/20 bg-black">
              {isVideoEnabled ? (
                <video
                  ref={localRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-700 text-[10px] tracking-tighter uppercase">
                  Камера выкл.
                </div>
              )}
            </div>
          </div>

          {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
          <div className="mt-8 flex items-center gap-6">
            <button
              onClick={toggleVideo}
              className={`rounded-full p-6 transition-all active:scale-90 ${isVideoEnabled ? "bg-blue-600" : "bg-slate-700"}`}
              title={isVideoEnabled ? "Выключить камеру" : "Включить камеру"}
            >
              {isVideoEnabled ? "📹" : "📷"}
            </button>
            <button
              onClick={() => endCall(true)}
              className="rounded-full bg-red-500 p-8 text-2xl shadow-xl transition-all hover:bg-red-600 active:scale-90"
            >
              🛑 Завершить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
