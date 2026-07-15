import logo from "@/assets/abcuna-logo.png";
import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeMap = {
  sm: { img: 28, title: "text-base", sub: "text-[10px]" },
  md: { img: 40, title: "text-lg", sub: "text-[11px]" },
  lg: { img: 56, title: "text-2xl", sub: "text-xs" },
  xl: { img: 96, title: "text-4xl", sub: "text-sm" },
};

export function AbcunaBrand({ size = "md", showText = true, className, textClassName }: Props) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <img
          src={logo}
          alt="ABCUNA"
          width={s.img}
          height={s.img}
          className="object-contain drop-shadow-[0_0_12px_oklch(0.58_0.22_28/0.45)]"
        />
      </div>
      {showText && (
        <div className={cn("flex flex-col leading-tight", textClassName)}>
          <span className={cn("font-black tracking-[0.18em] text-foreground", s.title)}>
            ABCUNA
          </span>
          <span className={cn("uppercase tracking-[0.22em] text-muted-foreground", s.sub)}>
            Bombeiros Civis · Uiraúna
          </span>
        </div>
      )}
    </div>
  );
}
