export type NutrientItem = {
  id: string;
  name: string;
  slug: string;
  amount: string;
  bg: string;
  description: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  description: string;
  macroTitle: string;
  macroIntro: string;
  microIntro: string;
  macroNutrients: NutrientItem[];
  microNutrients: NutrientItem[];
  healthBenefits: string[];
  precautionsIntro: string;
  precautions: string[];
};

export type FoodSource = {
  image: string;
  name: string;
};

export type VitaminFoodSourceProduct = {
  slug: string;
  name: string;
  image: string;
  link: string;
  amount: string;
};

export type VitaminDetail = {
  slug: string;
  title: string;
  category: string;
  description: string;
  keyFunctionsHtml: string;
  foodSourcesIntro: string;
  foodSources: FoodSource[];
  foodSourcesNotesHtml: string;
  rdiHtml: string;
  deficiencyHtml: string;
  overdoseHtml: string;
};
