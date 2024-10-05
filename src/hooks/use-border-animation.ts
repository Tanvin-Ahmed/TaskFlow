"use client";

import { useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

const useBorderAnimation = () => {
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const maskImage = useMotionTemplate`radial-gradient(100px 100px at ${offsetX}px ${offsetY}px, black, transparent)`;
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!borderRef.current) return;

      const rect = borderRef.current?.getBoundingClientRect();
      offsetX.set(e.x - rect.x);
      offsetY.set(e.y - rect.y);
    };
    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [offsetX, offsetY]);

  return {
    maskImageStyle: maskImage,
    animationRef: borderRef,
  };
};

export default useBorderAnimation;
