import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ShoppingCart, Grid3x3, List, X, Filter, CheckCircle, ArrowUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  partNumber: string;
  brand: string;
  price: number;
  shippingCost: number;
  estimatedShipping: string;
  validatedByManufacturer: boolean;
  availability: "in-stock" | "limited" | "out-of-stock";
  image: string;
  description: string;
  compatibleModels: string[];
}

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  partNumber: z.string().trim().min(1, "Part number is required").max(50, "Part number must be less than 50 characters"),
  brand: z.string().trim().min(1, "Brand is required").max(50, "Brand must be less than 50 characters"),
  price: z.coerce.number().positive("Price must be positive").max(999999, "Price is too high"),
  shippingCost: z.coerce.number().positive("Shipping cost must be positive").max(9999, "Shipping cost is too high"),
  estimatedShipping: z.string().trim().min(1, "Estimated shipping is required").max(50, "Estimated shipping must be less than 50 characters"),
  validatedByManufacturer: z.boolean(),
  availability: z.enum(["in-stock", "limited", "out-of-stock"]),
  image: z.string().trim().url("Must be a valid URL"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  compatibleModels: z.string().trim().min(1, "Compatible models are required").max(500, "Compatible models must be less than 500 characters"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Brake Pad Set",
    partNumber: "BP-2024-FR",
    brand: "Brembo",
    price: 84.99,
    shippingCost: 5.99,
    estimatedShipping: "2-3 business days",
    validatedByManufacturer: true,
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
    price: 47.99,
    shippingCost: 4.99,
    estimatedShipping: "3-5 business days",
    validatedByManufacturer: false,
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
    price: 284.99,
    shippingCost: 9.99,
    estimatedShipping: "1-2 business days",
    validatedByManufacturer: true,
    availability: "limited",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    description: "Complete brake upgrade kit with rotors and pads",
    compatibleModels: ["BMW 3 Series 2017-2024", "Audi A4 2018-2024"],
  },
  {
    id: "4",
    name: "OEM Brake Disc Set",
    partNumber: "BD-2024-OEM",
    brand: "Brembo",
    price: 159.99,
    shippingCost: 7.99,
    estimatedShipping: "2-4 business days",
    validatedByManufacturer: true,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    description: "Original equipment manufacturer brake discs for optimal performance",
    compatibleModels: ["Honda Civic 2020-2024", "Toyota Camry 2018-2023"],
  },
  {
    id: "5",
    name: "Sport Brake Caliper",
    partNumber: "BC-2024-SP",
    brand: "StopTech",
    price: 399.99,
    shippingCost: 12.99,
    estimatedShipping: "1-2 business days",
    validatedByManufacturer: true,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    description: "High-performance sport brake caliper with enhanced stopping power",
    compatibleModels: ["BMW 3 Series 2017-2024", "Audi A4 2018-2024"],
  },
  {
    id: "6",
    name: "Budget Brake Disc",
    partNumber: "BD-2024-BG",
    brand: "AutoParts Pro",
    price: 65.99,
    shippingCost: 5.99,
    estimatedShipping: "3-5 business days",
    validatedByManufacturer: false,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
    description: "Affordable brake disc for daily driving",
    compatibleModels: ["Ford F-150 2015-2023", "Chevrolet Silverado 2016-2024"],
  },
  {
    id: "7",
    name: "Racing Brake Fluid",
    partNumber: "BF-2024-RC",
    brand: "Brembo",
    price: 24.99,
    shippingCost: 3.99,
    estimatedShipping: "2-3 business days",
    validatedByManufacturer: true,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    description: "High-temperature racing brake fluid DOT 4",
    compatibleModels: ["Honda Civic 2020-2024", "Honda Accord 2019-2024", "BMW 3 Series 2017-2024"],
  },
  {
    id: "8",
    name: "Carbon Ceramic Brake Pads",
    partNumber: "BP-2024-CC",
    brand: "StopTech",
    price: 189.99,
    shippingCost: 8.99,
    estimatedShipping: "1-2 business days",
    validatedByManufacturer: true,
    availability: "limited",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    description: "Advanced carbon ceramic compound for maximum performance",
    compatibleModels: ["Audi A4 2018-2024", "BMW 3 Series 2017-2024"],
  },
  {
    id: "9",
    name: "Standard Brake Shoes",
    partNumber: "BS-2024-ST",
    brand: "AutoParts Pro",
    price: 39.99,
    shippingCost: 4.99,
    estimatedShipping: "3-5 business days",
    validatedByManufacturer: false,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
    description: "Standard brake shoes for rear drum brakes",
    compatibleModels: ["Ford F-150 2015-2023", "Chevrolet Silverado 2016-2024"],
  },
  {
    id: "10",
    name: "Heavy Duty Brake Line Kit",
    partNumber: "BL-2024-HD",
    brand: "Brembo",
    price: 129.99,
    shippingCost: 6.99,
    estimatedShipping: "2-3 business days",
    validatedByManufacturer: true,
    availability: "in-stock",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    description: "Stainless steel braided brake lines for improved brake feel",
    compatibleModels: ["Honda Civic 2020-2024", "Toyota Camry 2018-2023", "Honda Accord 2019-2024"],
  },
];

export const ProductSuggestions = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      partNumber: "",
      brand: "",
      price: 0,
      shippingCost: 0,
      estimatedShipping: "",
      validatedByManufacturer: false,
      availability: "in-stock",
      image: "",
      description: "",
      compatibleModels: "",
    },
  });

  // Extract unique models and brands
  const allModels = Array.from(new Set(products.flatMap((p) => p.compatibleModels)));
  const allBrands = Array.from(new Set(products.map((p) => p.brand)));

  // Filter products
  const filteredProducts = products.filter((product) => {
    const modelMatch = selectedModels.length === 0 || 
      product.compatibleModels.some((model) => selectedModels.includes(model));
    const brandMatch = selectedBrands.length === 0 || 
      selectedBrands.includes(product.brand);
    return modelMatch && brandMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "validated":
        return (b.validatedByManufacturer ? 1 : 0) - (a.validatedByManufacturer ? 1 : 0);
      default:
        return 0;
    }
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

  const onSubmit = (data: ProductFormValues) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: data.name,
      partNumber: data.partNumber,
      brand: data.brand,
      price: data.price,
      shippingCost: data.shippingCost,
      estimatedShipping: data.estimatedShipping,
      validatedByManufacturer: data.validatedByManufacturer,
      availability: data.availability,
      image: data.image,
      description: data.description,
      compatibleModels: data.compatibleModels.split(',').map(m => m.trim()),
    };
    
    setProducts([newProduct, ...products]);
    setDialogOpen(false);
    form.reset();
    toast({
      title: "Product added",
      description: "The new product has been added successfully.",
    });
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
      <div className="border-b border-border h-[64px] flex items-center px-4">
        <div className="w-full">
          <h2 className="text-lg font-semibold text-foreground">Suggested Parts</h2>
          <p className="text-sm text-muted-foreground">{sortedProducts.length} results found</p>
        </div>
      </div>

      {/* Controls: Filtering and Sorting */}
      <div className="sticky top-0 z-10 bg-card border-b border-border h-[64px] flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the product details below to add a new part to the catalog.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Premium Brake Pad Set" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="partNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Number</FormLabel>
                            <FormControl>
                              <Input placeholder="BP-2024-FR" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Brembo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select availability" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="in-stock">In Stock</SelectItem>
                                <SelectItem value="limited">Limited</SelectItem>
                                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="84.99" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Cost (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="5.99" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimatedShipping"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Shipping</FormLabel>
                            <FormControl>
                              <Input placeholder="2-3 business days" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://images.unsplash.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="High-performance ceramic brake pads..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="compatibleModels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compatible Models (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="Honda Civic 2020-2024, Honda Accord 2019-2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="validatedByManufacturer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Validated by Manufacturer
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Product</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-9">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="validated">Validated First</SelectItem>
            </SelectContent>
            </Select>
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
                          <span className="text-sm font-medium">Model</span>
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
                    
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="text-sm font-medium">Producer</span>
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
          {sortedProducts.map((product) => (
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
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        {product.validatedByManufacturer && (
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      <p className="mt-1 text-xs text-muted-foreground">#{product.partNumber}</p>
                      {expandedId !== product.id && (
                        <p className="mt-1 text-lg font-bold text-foreground">
                          €{product.price.toFixed(2)}
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

                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getAvailabilityColor(product.availability)}>
                        {product.availability.replace("-", " ")}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">
                          €{product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          + €{product.shippingCost.toFixed(2)} shipping
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Est. delivery: {product.estimatedShipping}
                        </div>
                      </div>
                    </div>
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
