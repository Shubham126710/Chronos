"use client";
import { DitherShader } from "@/components/ui/dither-shader";

export default function DitherShaderDemo() {
  return (
    <div className="w-full relative overflow-hidden rounded opacity-70">
      <DitherShader
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
        gridSize={2}
        ditherMode="bayer"
        colorMode="grayscale"
        invert={false}
        animated={true}
        animationSpeed={0.01}
        primaryColor="#000000"
        secondaryColor="#ffffff"
        threshold={0.5}
        className="h-64 lg:h-[280px] w-full"
      />
    </div>
  );
}
