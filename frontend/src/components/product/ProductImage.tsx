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
  /** inner padding around the packshot, e.g. "p-3" */
  pad?: string;
}

/** Product visual: real packshot on white when present, otherwise a tinted emoji tile. */
export default function ProductImage({ image, emoji, name, color, className, emojiClassName, priority, pad = "p-[8%]" }: Props) {
  const src = imgUrl(image);
  if (src) {
    return (
      <div className={cn("photo-tile relative overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={cn("h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]", pad)}
        />
      </div>
    );
  }
  // same light "packshot" base as real photos so mixed grids stay consistent in both themes
  return (
    <div className={cn("photo-tile relative overflow-hidden", className)} aria-label={name} role="img">
      <div className="absolute inset-0" style={{ background: tileGradient(color) }} />
      <div className={cn("emoji-tile relative", emojiClassName)}>{emoji || "🛒"}</div>
    </div>
  );
}
