import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ShoppingCart, X, Filter, CheckCircle, ArrowUpDown, Plus, Maximize2, MessageSquare } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  partNumber: string;
  brand: string;
  price: number;
  shippingCost: number;
  estimatedShipping: string;
  validatedByManufacturer: boolean;
  availability: string;
  purchasingUrl?: string;
  image?: string;
  images: string[];
  description: string;
  compatibleModels: string[];
  shippingCountry: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  partNumber: z.string().trim().min(1, "Part number is required").max(50, "Part number must be less than 50 characters"),
  brand: z.string().trim().min(1, "Brand is required").max(50, "Brand must be less than 50 characters"),
  price: z.coerce.number().min(0, "Price must be 0 or positive").max(999999, "Price is too high"),
  shippingCost: z.coerce.number().min(0, "Shipping cost must be 0 or positive").max(9999, "Shipping cost is too high"),
  estimatedShipping: z.string().trim().min(1, "Estimated shipping is required").max(50, "Estimated shipping must be less than 50 characters"),
  validatedByManufacturer: z.boolean(),
  purchasingUrl: z.string().trim().url("Must be a valid URL").min(1, "Purchasing URL is required"),
  image: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  compatibleModels: z.string().trim().min(1, "Compatible models are required").max(500, "Compatible models must be less than 500 characters"),
  shippingCountry: z.string().trim().min(1, "Shipping country is required").max(50, "Shipping country must be less than 50 characters"),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or positive").max(99999, "Stock is too high"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductSuggestionsProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  products?: Product[];
}

export const ProductSuggestions = ({ onChatToggle, isChatOpen, products: externalProducts }: ProductSuggestionsProps = {}) => {
  const { toast } = useToast();
  const { products: apiProducts, isLoading: isProductLoading, createProduct } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

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
      purchasingUrl: "",
      image: "",
      description: "",
      compatibleModels: "",
      shippingCountry: "",
      stock: 0,
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
      case "delivery-fast":
        const getDays = (shipping: string) => {
          const match = shipping.match(/(\d+)-?(\d+)?/);
          return match ? parseInt(match[1]) : 999;
        };
        return getDays(a.estimatedShipping) - getDays(b.estimatedShipping);
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

  // Sync API products and external products (from chat) with local state
  useEffect(() => {
    console.log('ProductSuggestions: Syncing products', {
      apiProductsCount: apiProducts.length,
      externalProductsCount: externalProducts?.length || 0
    });
    
    // Merge API products and external products (from chat suggestions)
    const mergedProducts = [...apiProducts];
    
    if (externalProducts && externalProducts.length > 0) {
      // Add external products that aren't already in the list
      externalProducts.forEach((extProduct) => {
        if (!mergedProducts.find((p) => p.id === extProduct.id)) {
          mergedProducts.push(extProduct);
        }
      });
    }
    
    console.log('ProductSuggestions: Merged products count:', mergedProducts.length);
    
    // Always update products (even if empty, to clear when switching conversations)
    setProducts(mergedProducts);
  }, [apiProducts, externalProducts]);

  const onSubmit = async (data: ProductFormValues) => {
    const imageUrl = data.image || '/placeholder.svg';
    const productData = {
      name: data.name,
      partNumber: data.partNumber,
      brand: data.brand,
      price: data.price,
      shippingCost: data.shippingCost,
      estimatedShipping: data.estimatedShipping,
      validatedByManufacturer: data.validatedByManufacturer,
      availability: "in-stock" as const,
      purchasingUrl: data.purchasingUrl,
      image: imageUrl,
      images: [imageUrl],
      description: data.description,
      compatibleModels: data.compatibleModels.split(',').map(m => m.trim()),
      shippingCountry: data.shippingCountry,
      stock: data.stock,
    };
    
    // Send to API
    const result = await createProduct(productData);
    
    if (result) {
      setDialogOpen(false);
      form.reset();
      // Product will be added to list via useEffect when apiProducts updates
    }
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
    <TooltipProvider>
      <div className="flex h-screen flex-1 flex-col bg-card">
      {/* Header */}
      <div className="h-[88px] flex items-center justify-between px-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
          <p className="text-sm text-muted-foreground">{sortedProducts.length} parts found</p>
        </div>
        {onChatToggle && !isChatOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onChatToggle}
            className="flex-shrink-0 group"
          >
            <MessageSquare className="h-5 w-5 text-foreground group-hover:text-primary group-hover:fill-primary" />
          </Button>
        )}
      </div>

      {/* Controls: Filtering and Sorting */}
      <div className="sticky top-0 z-10 bg-card h-[64px] flex items-center px-4" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
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
                    Fill in the part details below to add a new repair component to the catalog.
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
                              <Input placeholder="iPhone 14 Pro OLED Display" {...field} />
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
                              <Input placeholder="LCD-IP14P-OL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="iFixit" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                      <FormField
                        control={form.control}
                      name="purchasingUrl"
                        render={({ field }) => (
                          <FormItem>
                          <FormLabel>Purchasing URL</FormLabel>
                              <FormControl>
                            <Input placeholder="https://example.com/product" {...field} />
                              </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="279.99" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingCost"
                        render={({ field }) => {
                          const priceValue = form.watch("price");
                          const isDisabled = !priceValue || priceValue === 0;
                          return (
                          <FormItem>
                            <FormLabel>Shipping Cost (€)</FormLabel>
                            <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="5.99" 
                                  {...field} 
                                  disabled={isDisabled}
                                />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                          );
                        }}
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
                            <Textarea placeholder="Original quality OLED replacement display..." {...field} />
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
                            <Input placeholder="iPhone 14 Pro, iPhone 14 Pro Max" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Country</FormLabel>
                            <FormControl>
                              <Input placeholder="USA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Amount</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
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
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isProductLoading}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isProductLoading}>
                        {isProductLoading ? "Adding..." : "Add Product"}
                      </Button>
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
              <SelectContent className="bg-card">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="validated">Validated First</SelectItem>
                <SelectItem value="delivery-fast">Fastest Delivery</SelectItem>
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
                <ScrollArea className="h-[400px]">
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
                        <div className="flex flex-wrap gap-1">
                          {allModels.map((model) => (
                            <Button
                              key={model}
                              variant={selectedModels.includes(model) ? "default" : "outline"}
                              size="sm"
                              className={`h-auto py-1 px-3 ${selectedModels.includes(model) ? 'bg-primary text-accent hover:bg-primary/90' : ''}`}
                              onClick={() => toggleModel(model)}
                            >
                              {model}
                              {selectedModels.includes(model) && (
                                <X className="ml-0.5 h-3 w-3" />
                              )}
                            </Button>
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
                        <div className="flex flex-wrap gap-1">
                          {allBrands.map((brand) => (
                            <Button
                              key={brand}
                              variant={selectedBrands.includes(brand) ? "default" : "outline"}
                              size="sm"
                              className={`h-auto py-1 px-3 ${selectedBrands.includes(brand) ? 'bg-primary text-accent hover:bg-primary/90' : ''}`}
                              onClick={() => toggleBrand(brand)}
                            >
                              {brand}
                              {selectedBrands.includes(brand) && (
                                <X className="ml-0.5 h-3 w-3" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Products List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-stretch justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <CardTitle className="text-base leading-none">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      <p className="mt-1 text-xs text-muted-foreground">#{product.partNumber}</p>
                      {expandedId !== product.id && (
                        <>
                          <p className="text-xs text-muted-foreground">Ships from: {product.shippingCountry}</p>
                          <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {expandedId !== product.id && (
                    <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
                      <div className="text-right space-y-0.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {product.price > 0 ? (
                          <div className="text-xl font-bold text-foreground">
                            €{(product.price + product.shippingCost).toFixed(2)}
                          </div>
                          ) : (
                            <div className="text-sm font-medium text-muted-foreground">
                              Ask Manufacturer
                            </div>
                          )}
                          {product.validatedByManufacturer && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Validated by manufacturer</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {product.price > 0 && (
                          <>
                        <div className="text-xs text-muted-foreground">
                          €{product.price.toFixed(2)} + €{product.shippingCost.toFixed(2)} ship
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.estimatedShipping}
                        </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.purchasingUrl) {
                              window.open(product.purchasingUrl, '_blank');
                            }
                          }}
                          disabled={!product.purchasingUrl}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Buy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {expandedId === product.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {expandedId === product.id && (
                <CardContent className="p-4 pt-0">
                  <Carousel className="mb-3 h-[400px]">
                    <CarouselContent className="h-[400px]">
                      {product.images.map((img, index) => (
                        <CarouselItem key={index} className="h-[400px]">
                          <div 
                            className="relative group cursor-pointer h-full flex items-center justify-center"
                            onClick={() => setFullscreenImage(img)}
                          >
                            <img
                              src={img}
                              alt={`${product.name} - Image ${index + 1}`}
                              className="h-full w-full rounded-lg object-contain bg-muted"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='16'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Maximize2 className="h-8 w-8 text-foreground" />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                  <p className="mb-3 text-sm text-muted-foreground">{product.description}</p>

                  <div className="mb-3 space-y-2">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-xs font-medium text-muted-foreground">Compatible:</span>
                      {product.compatibleModels.map((model) => (
                        <Button
                          key={model}
                          variant="secondary"
                          size="sm"
                          className={`h-auto py-0.5 px-2 text-xs ${selectedModels.includes(model) ? 'bg-primary text-accent' : 'bg-primary text-accent hover:bg-primary/90'}`}
                          onClick={() => toggleModel(model)}
                        >
                          {model}
                          {selectedModels.includes(model) && (
                            <X className="ml-0.5 h-2.5 w-2.5" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Ships from: {product.shippingCountry}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {product.price > 0 ? (
                          <div className="text-xl font-bold text-foreground">
                            €{product.price.toFixed(2)}
                          </div>
                          ) : (
                            <div className="text-sm font-medium text-muted-foreground">
                              Ask Manufacturer
                            </div>
                          )}
                          {product.validatedByManufacturer && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Validated by manufacturer</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {product.price > 0 && (
                          <>
                        <div className="text-xs text-muted-foreground">
                          + €{product.shippingCost.toFixed(2)} shipping
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Est. delivery: {product.estimatedShipping}
                        </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => {
                        if (product.purchasingUrl) {
                          window.open(product.purchasingUrl, '_blank');
                        }
                      }}
                      disabled={!product.purchasingUrl}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Buy from Manufacturer
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Fullscreen Image Dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-background p-4">
            <img
              src={fullscreenImage || ""}
              alt="Full size product image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='16'%3ENo Image Available%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
};
