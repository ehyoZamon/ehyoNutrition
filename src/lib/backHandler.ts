// lib/backHandler.ts
// Реестр обработчиков аппаратной кнопки "Назад" (Android).
// Любой компонент (шаг онбординга, шторка, модальное окно) может зарегистрировать
// свой обработчик. Последний зарегистрированный имеет приоритет.
// Если никто не обработал нажатие, глобальная логика (BackButtonHandler) решает сама:
// назад по истории или выход из приложения.
import { useEffect, useRef } from "react";

// Обработчик возвращает true, если нажатие обработано (дальше ничего не делаем),
// и false — если нужно передать нажатие следующему обработчику.
type BackHandler = () => boolean;

const stack: BackHandler[] = [];

export function registerBackHandler(handler: BackHandler): () => void {
  stack.push(handler);
  return () => {
    const i = stack.lastIndexOf(handler);
    if (i >= 0) stack.splice(i, 1);
  };
}

/** Вызывается глобальным слушателем. Возвращает true, если кто-то обработал нажатие. */
export function runBackHandlers(): boolean {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i]() === true) return true;
  }
  return false;
}

/**
 * Хук: пока enabled === true, кнопка "Назад" сначала попадёт в handler.
 *
 * Пример (шторка):
 *   useBackHandler(() => { closeSheet(); return true; }, isOpen);
 */
export function useBackHandler(handler: BackHandler, enabled: boolean = true) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    return registerBackHandler(() => handlerRef.current());
  }, [enabled]);
}
