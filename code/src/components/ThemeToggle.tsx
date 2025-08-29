// src/components/ThemeToggle.tsx
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // nice icons

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-3 right-3 p-2 rounded-xl shadow bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      aria-label="Toggle Theme"
    >
      {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
    </button>
  );
}
