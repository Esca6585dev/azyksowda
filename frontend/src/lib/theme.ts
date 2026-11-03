"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "az-theme";
const EVENT = "az-theme-change";

/** Runs in <head> before first paint so there is no light/dark flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;if(d){e.classList.add('dark')}else{e.classList.remove('dark')}var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',d?'#0e1110':'#2e9e44')}}catch(_){}})();`;

function read(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setTheme(t: Theme) {
  const el = document.documentElement;
  el.classList.toggle("dark", t === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#0e1110" : "#2e9e44");
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  return [theme, () => setTheme(theme === "dark" ? "light" : "dark")];
}
