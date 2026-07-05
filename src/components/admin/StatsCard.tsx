import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // tailwind bg class for icon container
  iconColor?: string; // tailwind text class for icon
  subtitle?: string;
}

const StatsCard = ({ title, value, icon: Icon, color = "bg-accent/10", iconColor = "text-accent", subtitle }: StatsCardProps) => (
  <div className="bg-[hsl(0,0%,100%)] rounded-2xl p-5 border border-border flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export default StatsCard;
