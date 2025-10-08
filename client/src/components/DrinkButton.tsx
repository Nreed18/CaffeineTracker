import { Coffee, Droplet, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DrinkButtonProps {
  name: string;
  caffeineAmount: number;
  icon?: "coffee" | "tea" | "soda";
  onClick?: () => void;
}

const iconMap = {
  coffee: Coffee,
  tea: Droplet,
  soda: Wine,
};

export function DrinkButton({ name, caffeineAmount, icon = "coffee", onClick }: DrinkButtonProps) {
  const Icon = iconMap[icon];

  return (
    <Card
      className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`button-drink-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-primary/10 p-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-base">{name}</h3>
          <p className="text-sm text-muted-foreground">{caffeineAmount}mg caffeine</p>
        </div>
      </div>
    </Card>
  );
}
