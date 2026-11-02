import { imgUrl } from "@/lib/api";
import { cn, tileGradient } from "@/lib/utils";

interface Props {
  image?: string | null;
  emoji?: string | null;
  name: string;
  color?: string | null;
  className?: string;
  emojiClassName?: string;
  priority?: boolean;
}

/** Product visual: uploaded image when present, otherwise a tinted emoji tile. */
export default function ProductImage({ image, emoji, name, color, className, emojiClassName, priority }: Props) {
  const src = imgUrl(image);
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-white", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: tileGradient(color) }} aria-label={name} role="img">
      <div className={cn("emoji-tile", emojiClassName)}>{emoji || "🛒"}</div>
    </div>
  );
}
