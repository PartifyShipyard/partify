import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ShoppingCart, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  partNumber: string;
  brand: string;
  price: number;
  availability: "in-stock" | "limited" | "out-of-stock";
  image: string;
  description: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Brake Pad Set",
    partNumber: "BP-2024-FR",
    brand: "Brembo",
    price: 89.99,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    description: "High-performance ceramic brake pads for front axle",
  },
  {
    id: "2",
    name: "Economy Brake Pad Set",
    partNumber: "BP-2024-EC",
    brand: "AutoParts Pro",
    price: 49.99,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
    description: "Reliable brake pads for everyday use",
  },
  {
    id: "3",
    name: "Performance Brake Kit",
    partNumber: "BK-2024-PR",
    brand: "StopTech",
    price: 299.99,
    availability: "limited",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    description: "Complete brake upgrade kit with rotors and pads",
  },
];

export const ProductSuggestions = () => {
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const getAvailabilityColor = (availability: Product["availability"]) => {
    switch (availability) {
      case "in-stock":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "limited":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "out-of-stock":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Suggested Parts</h2>
            <p className="text-sm text-muted-foreground">{mockProducts.length} results found</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products List */}
      <ScrollArea className="flex-1">
        <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3 p-4" : "space-y-3 p-4"}>
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    {expandedId !== product.id && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      <p className="mt-1 text-xs text-muted-foreground">#{product.partNumber}</p>
                      {expandedId !== product.id && (
                        <p className="mt-1 text-lg font-bold text-foreground">
                          ${product.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                  >
                    {expandedId === product.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedId === product.id && (
                <CardContent className="p-4 pt-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                  <p className="mb-3 text-sm text-muted-foreground">{product.description}</p>

                  <div className="mb-3 flex items-center justify-between">
                    <Badge className={getAvailabilityColor(product.availability)}>
                      {product.availability.replace("-", " ")}
                    </Badge>
                    <span className="text-xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <ShoppingCart className="mr-2 h-3 w-3" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
