"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getSession } from "@/lib/auth";
import { useNotificationStore } from "@/lib/store";
import { useToast } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

let socket: Socket | null = null;

export function useSocket() {
  const initialized = useRef(false);
  const { fetchNotifications } = useNotificationStore();
  const { show } = useToast();

  const connect = useCallback(() => {
    const session = getSession();
    if (!session?.accessToken || initialized.current) return;

    socket = io(API_URL, {
      auth: { token: session.accessToken },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("🔌 WebSocket connected");
      initialized.current = true;
    });

    socket.on("disconnect", () => {
      console.log("🔌 WebSocket disconnected");
      initialized.current = false;
    });

    // ── Critical lab result alert ─────────────────────────────────────────────
    socket.on("critical_alert", (data: { testName: string; patientName: string; resultValue: string }) => {
      show(
        `🚨 CRITICAL: ${data.testName} — ${data.patientName} (${data.resultValue})`,
        "error"
      );
      fetchNotifications(); // refresh notification count
    });

    // ── Queue board update ────────────────────────────────────────────────────
    socket.on("queue_update", (_data: unknown) => {
      // Queue store will re-fetch on next render cycle
    });

    // ── General in-app notification ───────────────────────────────────────────
    socket.on("notification", (data: { type: string; title: string; message: string }) => {
      const toastType = data.type === "danger" ? "error"
        : data.type === "warning" ? "warning"
        : data.type === "success" ? "success"
        : "info";
      show(data.message, toastType);
      fetchNotifications();
    });

    // ── Emergency alert ───────────────────────────────────────────────────────
    socket.on("emergency_alert", (data: { message: string }) => {
      show(`🚨 EMERGENCY: ${data.message}`, "error");
    });

    // ── New prescription for pharmacist ──────────────────────────────────────
    socket.on("new_prescription", (data: { patientName: string }) => {
      show(`💊 New prescription: ${data.patientName}`, "info");
    });

  }, [fetchNotifications, show]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    socket = null;
    initialized.current = false;
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    socket?.emit(event, data);
  }, []);

  useEffect(() => {
    connect();
    return () => { disconnect(); };
  }, [connect, disconnect]);

  return { emit, connected: initialized.current };
}

export function getSocket() { return socket; }
