"use client";

import Image from "next/image";

export function TransportPhoto({ src, alt, hero = false }: { src: string; alt: string; hero?: boolean }) {
  return (
    <button type="button" className={hero ? "transport-photo hero-photo" : "transport-photo"} aria-label={alt}
      onClick={(event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const photo = event.currentTarget;
        photo.getAnimations().forEach((animation) => animation.cancel());
        photo.animate([
          { transform: "translateY(0)" },
          { transform: "translateY(-3px)" },
          { transform: "translateY(0)" },
        ], { duration: 420, easing: "ease-in-out" });
      }}>
      {hero
        ? <Image src={src} alt={alt} fill sizes="100vw" preload draggable={false} />
        : <Image src={src} alt={alt} width={1280} height={640} sizes="(max-width: 700px) 100vw, 50vw" draggable={false} />}
    </button>
  );
}
