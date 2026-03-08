import Image from "next/image";
import { imgUrl, videoUrl } from "@/lib/api";
import type { BarberMedia } from "@/types";

interface Props {
  media: BarberMedia[];
}

export default function PortfolioGrid({ media }: Props) {
  if (media.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl tracking-widest text-white mb-6">
        PORTAFOLIO
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {media.map((item) => (
          <MediaItem key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}

function MediaItem({ item }: { item: BarberMedia }) {
  // Embed externo (YouTube, Instagram...)
  if (item.tipo === "embed" && item.urlEmbed) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#111]">
        <iframe
          src={item.urlEmbed}
          className="absolute inset-0 w-full h-full"
          title={item.descripcion ?? "Portafolio"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Video local
  if (item.tipo === "video" && item.nombreArchivo) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#111]">
        <video
          src={videoUrl(item.nombreArchivo)}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          controls
        />
      </div>
    );
  }

  // Imagen local
  if (item.nombreArchivo) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#111] group">
        <Image
          src={imgUrl(item.nombreArchivo)}
          alt={item.descripcion ?? "Portafolio"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
        />
      </div>
    );
  }

  return null;
}
