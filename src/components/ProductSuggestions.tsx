import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ShoppingCart, Grid3x3, List, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
  partNumber: string;
  brand: string;
  price: number;
  availability: "in-stock" | "limited" | "out-of-stock";
  image: string;
  description: string;
  compatibleModels: string[];
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
    compatibleModels: ["Honda Civic 2020-2024", "Honda Accord 2019-2024", "Toyota Camry 2018-2023"],
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
    compatibleModels: ["Ford F-150 2015-2023", "Chevrolet Silverado 2016-2024"],
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
    compatibleModels: ["BMW 3 Series 2017-2024", "Audi A4 2018-2024"],
  },
];

export const ProductSuggestions = () => {
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Extract unique models and brands
  const allModels = Array.from(new Set(mockProducts.flatMap((p) => p.compatibleModels)));
  const allBrands = Array.from(new Set(mockProducts.map((p) => p.brand)));

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    const modelMatch = selectedModels.length === 0 || 
      product.compatibleModels.some((model) => selectedModels.includes(model));
    const brandMatch = selectedBrands.length === 0 || 
      selectedBrands.includes(product.brand);
    return modelMatch && brandMatch;
  });

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedModels([]);
    setSelectedBrands([]);
  };

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
      <div className="border-b border-border h-[72px] flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Suggested Parts</h2>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} results found</p>
          </div>
          <div className="flex gap-1">
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={filtersOpen ? "secondary" : "ghost"}
                  size="icon"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-96 bg-card border-border shadow-lg z-50" 
                align="end"
                sideOffset={8}
              >
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 pr-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                      {(selectedModels.length > 0 || selectedBrands.length > 0) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear All
                        </Button>
                      )}
                    </div>
                    
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="text-sm font-medium">Filter by Model</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="flex flex-wrap gap-2">
                          {allModels.map((model) => (
                            <Badge
                              key={model}
                              variant={selectedModels.includes(model) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => toggleModel(model)}
                            >
                              {model}
                              {selectedModels.includes(model) && (
                                <X className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="text-sm font-medium">Filter by Producer</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="flex flex-wrap gap-2">
                          {allBrands.map((brand) => (
                            <Badge
                              key={brand}
                              variant={selectedBrands.includes(brand) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => toggleBrand(brand)}
                            >
                              {brand}
                              {selectedBrands.includes(brand) && (
                                <X className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
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
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0 items-center">
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

                  <div className="mb-3 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Compatible:</span>
                      {product.compatibleModels.map((model) => (
                        <Badge key={model} variant="secondary" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>

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
