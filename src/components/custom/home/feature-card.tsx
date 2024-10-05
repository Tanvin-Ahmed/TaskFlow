/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useBorderAnimation from "@/hooks/use-border-animation";
import Image from "next/image";
import { motion } from "framer-motion";

type FeatureCardProps = {
  src: any;
  title: string;
  description: string;
};

const FeatureCard = ({ src, title, description }: FeatureCardProps) => {
  const { animationRef, maskImageStyle } = useBorderAnimation();

  return (
    <Card className="relative flex h-full flex-col rounded border-purple-200 bg-[#f1ecff] dark:border-purple-950 dark:bg-indigo-900/5 dark:backdrop-blur-sm">
      <motion.div
        className="absolute inset-0 z-10 rounded border-4 border-purple-400"
        style={{
          WebkitMaskImage: maskImageStyle,
          maskImage: maskImageStyle,
        }}
        ref={animationRef}
      />
      <CardHeader>
        <Image
          src={src}
          alt="feature-img"
          width={400}
          height={300}
          className="w-full rounded-md object-cover"
        />
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
