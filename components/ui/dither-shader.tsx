import React, { useId } from "react";
import { cn } from "@/lib/utils";

type DitheringMode = "bayer" | "halftone" | "noise" | "crosshatch";
type ColorMode = "original" | "grayscale" | "duotone" | "custom";

interface DitherShaderProps {
  src: string;
  gridSize?: number;
  ditherMode?: DitheringMode;
  colorMode?: ColorMode;
  invert?: boolean;
  pixelRatio?: number;
  primaryColor?: string;
  secondaryColor?: string;
  customPalette?: string[];
  brightness?: number;
  contrast?: number;
  backgroundColor?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  threshold?: number;
  animated?: boolean;
  animationSpeed?: number;
  className?: string;
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.length === 3 ? c[0] + c[0] : c.substring(0, 2), 16) / 255,
    g: parseInt(c.length === 3 ? c[1] + c[1] : c.substring(2, 4), 16) / 255,
    b: parseInt(c.length === 3 ? c[2] + c[2] : c.substring(4, 6), 16) / 255,
  };
}

export const DitherShader: React.FC<DitherShaderProps> = ({
  src,
  gridSize = 4,
  ditherMode = "bayer",
  colorMode = "original",
  invert = false,
  pixelRatio = 1,
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  brightness = 0,
  contrast = 1,
  backgroundColor = "transparent",
  objectFit = "cover",
  threshold = 0.5,
  className,
}) => {
  const filterId = useId();
  const pc = hexToRGB(primaryColor);
  const sc = hexToRGB(secondaryColor);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)} style={{ backgroundColor }}>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0  0.3333 0.3333 0.3333 0 0  0.3333 0.3333 0.3333 0 0  0 0 0 1 0" result="gray" />
          <feComponentTransfer in="gray" result="contrast">
            <feFuncR type="linear" slope={contrast * 2} intercept={brightness} />
            <feFuncG type="linear" slope={contrast * 2} intercept={brightness} />
            <feFuncB type="linear" slope={contrast * 2} intercept={brightness} />
          </feComponentTransfer>
          {colorMode === "duotone" && (
            <feColorMatrix
              type="matrix"
              values={`${sc.r - pc.r} 0 0 0 ${pc.r}  ${sc.g - pc.g} 0 0 0 ${pc.g}  ${sc.b - pc.b} 0 0 0 ${pc.b}  0 0 0 1 0`}
              result="duotone"
            />
          )}
          {colorMode === "grayscale" && <feColorMatrix type="saturate" values="0" result="duotone" />}
          {(colorMode === "original" || colorMode === "custom") && (
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="duotone" />
          )}
        </filter>
      </svg>

      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full z-10"
        style={{
          objectFit,
          filter: `url(#${filterId}) ${invert ? "invert(100%)" : ""}`,
          imageRendering: pixelRatio > 1 ? "pixelated" : "auto",
        }}
      />
      <div 
        className="absolute inset-0 h-full w-full z-20 mix-blend-hard-light pointer-events-none opacity-50"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="1" height="1" fill="%23fff" /><rect x="1" y="1" width="1" height="1" fill="%23fff" /><rect x="1" y="0" width="1" height="1" fill="%23000" /><rect x="0" y="1" width="1" height="1" fill="%23000" /></svg>')`,
          backgroundSize: `${gridSize * pixelRatio}px ${gridSize * pixelRatio}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

export default DitherShader;
