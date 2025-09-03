import { Link } from "react-router-dom";
import { Star, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Service } from "@/types";

export const ServiceCard = ({
  id,
  name,
  description,
  category,
  rating,
  reviewCount,
  location,
  providerName,
  featured = false
}: Service) => {
  return (
    <Link to={`/service/${id}`} className="block h-full text-left">
      <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col ${featured ? 'ring-2 ring-primary shadow-lg' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{name}</h3>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{category}</Badge>
                {featured && <Badge variant="default" className="text-xs">⭐ Featured</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 flex-grow">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{providerName}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 mt-auto">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};