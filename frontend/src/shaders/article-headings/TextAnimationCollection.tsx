import { Suspense, type CSSProperties } from "react";
import { ThreeUIIntro } from "../neuform-isolated/NeuformIsolatedEffects";

export type TextAnimationVariant = "threeui-intro" | "particle-wordmark" | "audio-wordmark";

export interface TextAnimationCollectionProps {
  variant?: TextAnimationVariant;
  mode?: "light" | "dark";
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
}

const fallback = (
  <div className="threeui-background" style={{ background: "#000000", width: "100%", height: "100%" }} />
);

export function TextAnimationCollection({
  variant = "threeui-intro",
  ...props
}: TextAnimationCollectionProps) {
  return (
    <Suspense fallback={fallback}>
      <ThreeUIIntro {...props} />
    </Suspense>
  );
}

export default TextAnimationCollection;
