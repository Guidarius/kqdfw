import Image from "next/image";

import type { Photo as PhotoData } from "@/lib/scene";

// Renders a photo inside the cohesive arcade frame. When `src` is
// empty it shows an intentional styled placeholder (never a broken
// image). `ratio` is a Tailwind aspect-ratio class for the frame.
export function Photo({
  photo,
  ratio = "aspect-square",
  priority = false,
  sizes,
}: {
  photo: PhotoData;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`photo-frame ${ratio}`}>
      {photo.src ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes ?? "(max-width: 640px) 100vw, 33vw"}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="photo-placeholder absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <span className="font-pixel text-[10px] uppercase tracking-widest text-amber-500/70">
            photo
          </span>
          <span className="text-xs text-stone-500">{photo.alt}</span>
        </div>
      )}
    </div>
  );
}
