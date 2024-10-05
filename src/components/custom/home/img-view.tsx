"use client";
import Tilt from "react-parallax-tilt";
import Image from "next/image";
import useBorderAnimation from "@/hooks/use-border-animation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ImgView = () => {
  const { animationRef, maskImageStyle } = useBorderAnimation();
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState("light");

  useEffect(() => {
    if (resolvedTheme) setMode(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <section className="flex justify-center items-center">
      <Tilt className="relative rounded-lg border-purple-200 dark:border-purple-950">
        <motion.div
          className="absolute inset-0 border-4 border-purple-400 rounded z-10"
          style={{
            WebkitMaskImage: maskImageStyle,
            maskImage: maskImageStyle,
          }}
          ref={animationRef}
        />

        {mode === "light" ? (
          <Image
            src={"/img/light.png"}
            height={500}
            width={800}
            alt="light"
            className="rounded-lg"
          />
        ) : (
          <Image
            src={"/img/dark.png"}
            height={500}
            width={800}
            alt="dark"
            className="rounded-lg"
          />
        )}
      </Tilt>
    </section>
  );
};

export default ImgView;
