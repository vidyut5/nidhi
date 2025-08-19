"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { demoProducts } from "@/lib/demo-data";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate search delay
    const timer = setTimeout(() => {
      const results = demoProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.categoryId.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Products</h1>
          <p className="text-gray-600">Enter a search term to find electrical products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              variant="market" 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No products found matching "{query}"</p>
          <p className="text-sm text-gray-500">Try different keywords or check spelling</p>
        </div>
      )}
    </div>
  );
}