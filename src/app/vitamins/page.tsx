import VitaminsClient from "./vitaminsClient";
import vitaminsEn from "@/data/en/vitamins.json";
import vitaminsRu from "@/data/ru/vitamins.json";

export default function VitaminsPage() {
  // Передаем статические массивы для обеих локализаций в клиентскую часть
  return <VitaminsClient vitaminsEn={vitaminsEn} vitaminsRu={vitaminsRu} />;
}