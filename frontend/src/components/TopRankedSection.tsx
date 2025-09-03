import { Trophy, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopService } from "@/types";

interface TopRankedSectionProps {
  services: TopService[];
  period?: string;
}

export const TopRankedSection = ({ services, period = "This Month" }: TopRankedSectionProps) => {
  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Top Ranked Services</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Celebrating the highest-rated services of {period.toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {services.map((service) => (
            <Card key={service.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`text-2xl ${getRankColor(service.rank)}`}>
                  {getRankIcon(service.rank)}
                </div>
              </div>

              {/* Winner Ribbon for #1 */}
              {service.rank === 1 && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 text-xs font-bold transform -rotate-45 -translate-x-3 translate-y-3">
                  WINNER
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {service.name}
                </CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {service.category}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{service.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {service.reviewCount} reviews
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Ranked #{service.rank} {period.toLowerCase()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};