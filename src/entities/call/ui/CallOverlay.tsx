"use client";

import { useEffect, useRef, useState } from "react";

import { callService } from "../api/callService"; // Импортируем наш новый сервис
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0);

  // ПУНКТ 5: Логика получения ICE-серверов перед принятием вызова
  const handleAccept = async () => {
    try {
      // 1. Запрашиваем конфиг (STUN/TURN) через сервис (как просил Тимлид)
      const iceServers = await callService.getIceServers();

      // 2. Передаем их в стор. Теперь аргумент на месте, ошибка TS уйдет.
      await acceptCall(iceServers);
    } catch (error) {
      console.error("Failed to accept call with ICE servers:", error);
      // Если всё совсем плохо, пробуем с дефолтными (хотя сервис вернет их сам)
      await acceptCall([{ urls: "stun:stun.l.google.com:19302" }]);
    }
  };

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoEnabled]);

  useEffect(() => {
    if (remoteStream) {
      if (audioRef.current) {
        audioRef.current.srcObject = remoteStream;
        audioRef.current.play().catch(() => console.warn("Audio blocked"));
      }
      if (remoteRef.current && remoteStream.getVideoTracks().length > 0) {
        remoteRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteStream || remoteStream.getAudioTracks().length === 0) return;

    interface WebkitWindow extends Window {
      webkitAudioContext: typeof AudioContext;
    }

    const audioContextClass =
      window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
    const ctx = new audioContextClass();

    const source = ctx.createMediaStreamSource(remoteStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let rafId: number;

    const update = () => {
      if (callStatus === "idle") return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setVolume(avg);
      rafId = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(rafId);
      void ctx.close();
    };
  }, [remoteStream, callStatus]);

  if (callStatus === "idle") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950/95 text-white backdrop-blur-md">
      <audio ref={audioRef} autoPlay playsInline />

      {callStatus === "ringing" && (
        <div className="flex flex-col items-center gap-8 rounded-[40px] border border-white/10 bg-slate-900 p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl shadow-lg">
              📞
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Входящий вызов</h2>
            <p className="mt-2 text-slate-400">Кто-то хочет поговорить с вами...</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAccept}
              className="rounded-2xl bg-green-500 px-10 py-4 text-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
            >
              Принять
            </button>
            <button
              onClick={() => endCall(true)}
              className="rounded-2xl bg-red-500 px-10 py-4 text-xl font-bold shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
            >
              Отклонить
            </button>
          </div>
        </div>
      )}

      {(callStatus === "calling" || callStatus === "connected") && (
        <div className="relative flex h-full w-full flex-col items-center justify-center p-6">
          <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-[40px] border border-white/5 bg-slate-900 shadow-2xl">
            {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
              <video ref={remoteRef} autoPlay playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-800 to-slate-900">
                <div
                  className={`flex h-40 w-40 items-center justify-center rounded-full bg-slate-700 transition-all duration-300 ${volume > 15 ? "scale-110 ring-4 ring-blue-500" : "scale-100"}`}
                >
                  <span className="text-7xl">👤</span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium text-slate-300">
                    {callStatus === "calling" ? "Вызов..." : "На связи"}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute right-8 bottom-8 z-20 aspect-video w-1/4 min-w-[160px] overflow-hidden rounded-2xl border-2 border-white/10 bg-black shadow-xl">
              {isVideoEnabled ? (
                <video
                  ref={localRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Камера выкл
                </div>
              )}
            </div>
          </div>
          <div className="mt-10 flex items-center gap-8">
            <button
              onClick={toggleVideo}
              className={`flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-90 ${isVideoEnabled ? "bg-blue-600 shadow-lg shadow-blue-600/30" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <span className="text-2xl">{isVideoEnabled ? "📹" : "📷"}</span>
            </button>
            <button
              onClick={() => endCall(true)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-3xl shadow-xl shadow-red-500/30 transition-all hover:bg-red-600 active:scale-90"
            >
              🛑
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
