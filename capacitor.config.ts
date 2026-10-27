import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ehyonutridiary.app', //com.ehyonutrition.app
  appName: 'NutriDiary',
  webDir: 'out',
  // В Capacitor 8 параметр android.adjustMarginsForEdgeToEdge удалён.
  // Отступы под системные панели теперь настраивает плагин SystemBars (см. ниже).
  plugins: {
    SystemBars: {
      // native: WebView сам учитывает meta viewport-fit=cover (у вас уже стоит cover),
      // env(safe-area-inset-*) содержат правильные значения -> ваши .system-bar работают.
      insetsHandling: 'native',
      // Подсказка, чтобы не было "прыжка" раскладки при запуске
      initialViewportFitValueHint: 'cover',
    },
    StatusBar: {
      overlaysWebView: true, // edge-to-edge с самого запуска, ещё до JS
      style: 'DARK',         // тёмные иконки — подходят под светлый #fefefe
    },
    SplashScreen: {
      launchAutoHide: false, // скрываем сплэш вручную после инициализации
      backgroundColor: '#fefefe', // цвет фона сплэша, чтобы не было резкого перехода к светлой странице
    },
  },
};

export default config;