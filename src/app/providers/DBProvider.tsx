// app/providers/DBProvider.tsx
"use client";
import { useEffect, useState } from "react";
import { initDB } from "@/lib/db";

export default function DBProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    initDB()
      .then(() => setStatus("ready"))
      .catch((err) => {
        console.error("Не удалось инициализировать БД:", err);
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return <div style={{ padding: 20 }}>Загрузка базы данных...</div>;
  }

  if (status === "error") {
    return (
      <div style={{ padding: 20 }}>
        Не удалось загрузить базу данных.{" "}
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  return <>{children}</>;
}