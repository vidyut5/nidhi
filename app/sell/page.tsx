"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate price before sending
    const priceTrimmed = price.trim();
    const priceNum = Number(priceTrimmed);
    if (!priceTrimmed || !Number.isFinite(priceNum) || priceNum < 0) {
      console.error('Invalid price input:', price);
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: priceNum,
          imageUrls: [imageUrl],
          categoryId: "temp", // This would come from a category selector
        }),
      });

      if (response.ok) {
        alert("Product listed successfully!");
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
      } else {
        alert("Failed to list product");
      }
    } catch (error: any) {
      console.error('Sell page error:', error, error?.stack);
      // show a friendly message instead of alert
    }
  };

  return (
    <div className="container-wide py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Quick List a Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your product"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Product Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
              {imageUrl && (
                <div className="mt-4">
                  {/* In production, validate URL and use Next/Image */}
                  <img src={imageUrl} alt="Product preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

              <Button type="submit" className="w-full">
                List Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}