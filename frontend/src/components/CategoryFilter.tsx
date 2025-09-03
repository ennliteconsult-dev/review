import { Badge } from "@/components/ui/badge";

const categories = [
  "All",
  "Home Services", 
  "Beauty & Wellness",
  "Professional Services",
  "Automotive",
  "Health & Medical",
  "Education & Training",
  "Technology",
  "Food & Catering",
  "Event Planning"
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "secondary"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};