"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const photos = [
  { src: "/images/loading-truck.png", alt: "A man loading cardboard boxes onto the open tailgate of a white truck", caption: "Ready for your next move" },
  { src: "/images/long-white-green-truck.png", alt: "Side view of a long white flatbed truck with green detail on the cab", caption: "Space for your transport needs" },
  { src: "/images/white-truck-side.png", alt: "Side view of a white truck with silver drop-side cargo panels", caption: "Local transport, personal service" },
];

export function TruckSlider() {
  const [active, setActive] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const move = (direction: number) => setActive((index) => (index + direction + photos.length) % photos.length);

  return (
    <section className="truck-slider" aria-label="Transport photographs" aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          setActive(event.key === "Home" ? 0 : photos.length - 1);
        }
      }}>
      <div className="slider-heading"><span>LOCAL ROOTS. READY TO MOVE.</span><span aria-hidden="true">0{active + 1} / 03</span></div>
      <div className="slider-viewport"
        onTouchStart={(event) => {
          swiped.current = false;
          touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }}
        onTouchCancel={() => { touch.current = null; }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            swiped.current = true;
            move(dx < 0 ? 1 : -1);
          }
          touch.current = null;
        }}>
        <div className="slider-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {photos.map((photo, index) => (
            <div className="slider-slide" key={photo.src} role="group" aria-roledescription="slide" aria-label={`${index + 1} of 3`} aria-hidden={index !== active} inert={index !== active}>
              <button className="slider-photo" tabIndex={index === active ? 0 : -1} aria-label={`${photo.alt}. Show next photograph`}
                onClick={() => { if (swiped.current) { swiped.current = false; return; } move(1); }}>
                <Image src={photo.src} alt={photo.alt} width={1280} height={640} sizes="(max-width: 800px) 100vw, 60vw" preload={index === 0} loading={index === 0 ? undefined : "eager"} draggable={false} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="slider-caption" aria-live="polite" aria-atomic="true">{photos[active].caption}<span className="sr-only">. Photograph {active + 1} of 3.</span></div>
      <div className="slider-controls">
        <button className="slider-arrow" aria-label="Previous photograph" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <div className="slider-indicators" role="group" aria-label="Choose a photograph">
          {photos.map((photo, index) => <button key={photo.src} aria-label={`Show photograph ${index + 1}: ${photo.alt}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)}><span /></button>)}
        </div>
        <button className="slider-arrow" aria-label="Next photograph" onClick={() => move(1)}><ArrowRight size={20} /></button>
      </div>
    </section>
  );
}
