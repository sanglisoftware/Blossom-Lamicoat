import {
  selectTheme,
  getTheme,
  setTheme,
  themes,
  Themes,
} from "@/stores/themeSlice";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Main() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const Component = getTheme(theme).component;

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const switchTheme = (theme: Themes["name"]) => {
    dispatch(setTheme(theme));
  };

  useEffect(() => {
    if (queryParams.get("theme")) {
      const selectedTheme = themes.find(
        (theme) => theme.name === queryParams.get("theme")
      );

      if (selectedTheme) {
        switchTheme(selectedTheme.name);
      }
    }
  }, []);

  // 🔐 Countdown and logout logic
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decodeToken = (token: string) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch (err) {
        return null;
      }
    };

    const { exp } = decodeToken(token) || {};
    if (!exp) return;

    const logoutTime = exp * 1000;
    const timeLeft = logoutTime - Date.now();

    if (timeLeft > 10000) {
      setTimeout(() => {
        let count = 10;
        setCountdown(count);
        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count === 0) {
            clearInterval(interval);
          }
        }, 1000);
      }, timeLeft - 10000);
    }

    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }, timeLeft);
  }, []);
  return (
    <div>
      <ThemeSwitcher />
      <Component />
      {/* ⏱️ Countdown UI */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          🔐 Logging out in <strong>{countdown}</strong> seconds...
        </div>
      )}
    </div>
  );
}

export default Main;
