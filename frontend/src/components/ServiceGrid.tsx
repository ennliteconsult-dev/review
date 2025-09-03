import { ServiceCard } from "./ServiceCard";
import { Service } from "@/types";

interface ServiceGridProps {
  services: Service[];
  title?: string;
}

export const ServiceGrid = ({ services, title }: ServiceGridProps) => {
  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>
    </div>
  );
};