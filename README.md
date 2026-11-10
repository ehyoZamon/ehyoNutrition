This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




# Полезные команды
Remove-Item -Recurse -Force .next, out -ErrorAction SilentlyContinue
npx cap sync
npx cap copy
npx cap open android
npm run build
npm run pack




# Подключение аналитики (Firebase Analytics + Capacitor)

## 1. Установка
```bash
npm i @capacitor-firebase/analytics firebase @capacitor/app
npx cap sync android
```

## 2. Firebase / Android
1. Создай проект в Firebase Console, добавь Android-приложение (package name = твой appId из capacitor.config).
2. Скачай `google-services.json` и положи в `android/app/`.
3. В `android/build.gradle` (buildscript → dependencies):
   `classpath 'com.google.gms:google-services:4.4.2'`
4. В конец `android/app/build.gradle`:
   `apply plugin: 'com.google.gms.google-services'`
   (если файла нет — плагин сам подхватит, но блок
   `try { def f = file("google-services.json"); if (f.text) apply plugin: 'com.google.gms.google-services' } catch(e) {}`
   — это стандартный шаблон Capacitor, он уже может быть в файле).
5. `npx cap sync android` и пересобери приложение.

## 3. Файлы из этого архива
| Файл | Куда положить |
|---|---|
| `lib/analytics.ts` | `lib/analytics.ts` |
| `components/AnalyticsTracker.tsx` | `components/AnalyticsTracker.tsx` |
| `app/layout.tsx` | заменить свой (добавлен только импорт и `<AnalyticsTracker />`) |

## 4. События в существующих файлах (точечные правки)

### productsClient.tsx
```ts
import { track, AnalyticsEvent } from "@/lib/analytics";
```
Открытие шторки продукта:
```ts
const handleOpen = useCallback((slug: string) => {
  setOpenedSlug(slug);
  track(AnalyticsEvent.ProductSheetOpen, { slug });
}, []);
// ...
<ProductRow ... onOpen={handleOpen} />
```
Выбор категории (в `handleChipClick`, внутри `setSelectedCategory` не вызывать — только рядом):
```ts
track(AnalyticsEvent.CategoryChipSelect, { category: category ?? "all" });
```
Поиск — с задержкой, чтобы не слать событие на каждую букву:
```ts
useEffect(() => {
  if (deferredSearch.trim().length < 2) return;
  const id = setTimeout(
    () => track(AnalyticsEvent.SearchProducts, { query_length: deferredSearch.trim().length }),
    800
  );
  return () => clearTimeout(id);
}, [deferredSearch]);
```
Избранное (в `toggleFavorite`): `track(AnalyticsEvent.FavoriteToggle);`

### productInfoClient.tsx
После успешной загрузки (`if (!cancelled) { setData(...) }`):
```ts
track(AnalyticsEvent.ProductInfoOpen, { slug });
```

### Food Diary / вода / онбординг / настройки
- добавление еды: `track(AnalyticsEvent.FoodAdded, { meal_type })` (только тип приёма пищи, без названий и калорий)
- удаление: `track(AnalyticsEvent.FoodRemoved)`
- вода: `track(AnalyticsEvent.WaterAdded)`
- конец онбординга: `track(AnalyticsEvent.OnboardingCompleted)`
- смена языка: `track(AnalyticsEvent.LanguageChanged, { language })`
- экспорт/импорт бэкапа: `BackupExport` / `BackupImport`

## 5. Переключатель согласия в /settings
```tsx
import { isAnalyticsEnabled, setAnalyticsEnabled } from "@/lib/analytics";

const [analytics, setAnalytics] = useState(true);
useEffect(() => setAnalytics(isAnalyticsEnabled()), []);

<label>
  <input
    type="checkbox"
    checked={analytics}
    onChange={(e) => { setAnalytics(e.target.checked); setAnalyticsEnabled(e.target.checked); }}
  />
  {isRu ? "Помогать улучшать приложение (анонимная статистика)" : "Help improve the app (anonymous statistics)"}
</label>
```

## 6. Где смотреть данные
Firebase Console → Analytics:
- Events: все события; `screen_view` по `screen_name`: самые и наименее посещаемые экраны
- Engagement: время в приложении (`user_engagement`, среднее время вовлечённости)
- `app_background.session_seconds`: своя длительность сессий (через параметры событий; зарегистрируй параметр как custom metric)
- DebugView для проверки:
  `adb shell setprop debug.firebase.analytics.app <твой.package.name>`

## 7. Приватность
- Не отправляй вес, рост, дату рождения, имя, названия продуктов из дневника и значения.
- Опиши сбор в политике конфиденциальности и в Data safety (Google Play / RuStore).
- Данные в Firebase появляются с задержкой до нескольких часов; DebugView показывает сразу.