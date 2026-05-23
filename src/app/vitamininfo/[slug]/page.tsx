import { notFound } from "next/navigation";
import VitaminInfoClient from "./VitaminInfoClient";
import { getVitaminDetail, getVitaminSlugs } from "@/lib/details";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getVitaminSlugs().map((slug) => ({ slug }));
}

export default async function VitaminInfoPage({ params }: PageProps) {
  const { slug } = await params;
  const vitamin = getVitaminDetail(slug);

  if (!vitamin) {
    notFound();
  }

  return <VitaminInfoClient vitamin={vitamin} />;
}
