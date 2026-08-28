import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ImageSlideshow({ images = [], alt = "" }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef();
  const touchStartX = useRef(null);

  const count = images.length;

  const goTo = (i) => setIndex(((i % count) + count) % count);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-advance every 4s, pauses while the user is interacting via hover.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (count <= 1 || paused) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearInterval(timerRef.current);
  }, [count, paused]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) prev();
    else if (delta < -40) next();
    touchStartX.current = null;
  };

  if (count === 0) {
    return (
      <div className="pd-main-img">
        <span style={{ fontSize: 52 }}>💻</span>
      </div>
    );
  }

  return (
    <div className="pd-gallery">
      <div
        className="pd-main-img slideshow-main"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={images[index].publicId || index}
          src={images[index].url}
          alt={`${alt} - photo ${index + 1} of ${count}`}
          fill
          sizes="(max-width: 700px) 100vw, 480px"
          style={{ objectFit: "cover", borderRadius: 12 }}
          priority={index === 0}
        />
        {count > 1 && (
          <>
            <button className="slideshow-arrow left" aria-label="Previous image" onClick={prev}>‹</button>
            <button className="slideshow-arrow right" aria-label="Next image" onClick={next}>›</button>
            <div className="slideshow-dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`slideshow-dot ${i === index ? "active" : ""}`}
                  onClick={() => goTo(i)}
                  role="button"
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="pd-thumbs">
          {images.map((img, i) => (
            <div
              key={img.publicId || i}
              className={i === index ? "active" : ""}
              style={{ backgroundImage: `url(${img.url})`, backgroundSize: "cover", cursor: "pointer" }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
