export type OrganKey =
  | "eyes"
  | "brain"
  | "heart"
  | "blood"
  | "bones"
  | "joints"
  | "muscles"
  | "skin"
  | "immune"
  | "digestion"
  | "liver"
  | "thyroid"
  | "metabolism";

export interface Organ {
  key: OrganKey;
  en: string;
  ru: string;
}

export const ORGANS: Organ[] = [
  { key: "eyes", en: "Eyes", ru: "Глаза" },
  { key: "brain", en: "Brain & nervous system", ru: "Мозг и нервная система" },
  { key: "heart", en: "Heart & circulation", ru: "Сердце и кровообращение" },
  { key: "blood", en: "Blood", ru: "Кровь" },
  { key: "bones", en: "Bones & teeth", ru: "Кости и зубы" },
  { key: "joints", en: "Joints & cartilage", ru: "Суставы и хрящи" },
  { key: "muscles", en: "Muscles", ru: "Мышцы" },
  { key: "skin", en: "Skin, hair & nails", ru: "Кожа, волосы, ногти" },
  { key: "immune", en: "Immune system", ru: "Иммунитет" },
  { key: "digestion", en: "Digestion & gut", ru: "Пищеварение" },
  { key: "liver", en: "Liver", ru: "Печень" },
  { key: "thyroid", en: "Thyroid", ru: "Щитовидная железа" },
  { key: "metabolism", en: "Metabolism & energy", ru: "Метаболизм и энергия" },
];