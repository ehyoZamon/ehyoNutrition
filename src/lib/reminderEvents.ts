// lib/reminderEvents.ts
// Крошечный модуль без импортов: через него lib/diary.ts может попросить
// перепланировать напоминания о еде, не создавая циклической зависимости
// (mealReminders.ts сам читает diary.ts).

export const MEAL_SYNC_EVENT = "meal-reminders:sync";

/** Попросить перепланировать напоминания о запланированных приёмах пищи. */
export function requestMealReminderSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MEAL_SYNC_EVENT));
}
