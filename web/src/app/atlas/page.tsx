import { getCategories, getFrictions } from "@/lib/api";
import AtlasClient from "@/components/AtlasClient";

export default function AtlasExplorer() {
  const categories = getCategories();
  const totalFrictions = getFrictions().length;
  return <AtlasClient categories={categories} totalFrictions={totalFrictions} />;
}
