import { getPatternsByVolume } from "@/lib/api";
import VolumeClient from "@/components/VolumeClient";

export async function generateStaticParams() {
  const volumes = getPatternsByVolume();
  return volumes.map((v: any) => ({
    slug: v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  }));
}

export default async function VolumePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const volumes = getPatternsByVolume();
  const volume = volumes.find(
    (v: any) => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug
  );

  if (!volume) return <div className="max-w-7xl mx-auto px-4 py-8">Volume not found</div>;

  return <VolumeClient volume={volume} slug={slug} />;
}
