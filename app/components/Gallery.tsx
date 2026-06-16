import type { Photo as PhotoData } from "@/lib/scene";
import { Photo } from "./Photo";

// Responsive photo wall that shows off the scene. Adapts to however
// many photos are listed in lib/scene.ts.
export function Gallery({ photos }: { photos: PhotoData[] }) {
  if (photos.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo, i) => (
        <Photo
          key={photo.src || photo.alt + i}
          photo={photo}
          sizes="(max-width: 640px) 50vw, 33vw"
        />
      ))}
    </div>
  );
}
