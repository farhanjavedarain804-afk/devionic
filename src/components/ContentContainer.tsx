import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children: ReactNode;
  /** Extra Tailwind classes to merge onto the wrapper */
  className?: string;
  /**
   * Variant controls the maximum content width:
   * - "default" → max-w-[1280px] (standard page content, cards grids, etc.)
   * - "prose"   → max-w-[900px]  (long-form article/legal text – readable but not cramped)
   * - "wide"    → max-w-[1440px] (hero-width sections, full-bleed grids)
   * - "narrow"  → max-w-[720px]  (single-column form or intro paragraph)
   */
  variant?: "default" | "prose" | "wide" | "narrow";
}

const variantClasses: Record<string, string> = {
  default: "max-w-[1280px]",
  prose:   "max-w-[900px]",
  wide:    "max-w-[1440px]",
  narrow:  "max-w-[720px]",
};

/**
 * ContentContainer
 *
 * Drop-in replacement for the ad-hoc `container mx-auto px-4 max-w-*` pattern
 * used throughout the codebase. Provides:
 *   - Centered layout (mx-auto)
 *   - Responsive horizontal padding (px-4 → px-6 → px-8 → px-12)
 *   - Consistent max-width across all content pages
 */
const ContentContainer = ({
  children,
  className,
  variant = "default",
}: ContentContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        "px-4 sm:px-6 lg:px-8 xl:px-12",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

export default ContentContainer;
