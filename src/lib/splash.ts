import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

let hidden = false;

export async function hideSplash() {
  if (hidden) return;
  hidden = true;
  if (!Capacitor.isNativePlatform()) return;

  // дожидаемся, пока WebView реально отрисует кадр
  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r()))
  );
  try {
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    /* плагин недоступен */
  }
}