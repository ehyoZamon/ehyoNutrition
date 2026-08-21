// lib/sqlite-web-init.ts
'use client';

export async function initWebStore() {
  if (typeof window === 'undefined') return;

  const { defineCustomElements } = await import('jeep-sqlite/loader');
  await defineCustomElements(window);

  let jeepEl = document.querySelector('jeep-sqlite');
  if (!jeepEl) {
    jeepEl = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepEl);
    await customElements.whenDefined('jeep-sqlite');
    // Даём элементу время смонтироваться перед обращением к нему
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}