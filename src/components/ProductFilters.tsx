'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
  categories: string[];
  priceRange: { min: number; max: number };
}

export interface FilterState {
  category: string[];
  priceMin: number;
  priceMax: number;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

export default function ProductFilters({
  onFilterChange,
  onSortChange,
  categories,
  priceRange,
}: FilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    priceMin: priceRange.min,
    priceMax: priceRange.max,
    sizes: [],
    colors: [],
    inStock: false,
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Green'];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleArrayFilter = (key: 'category' | 'sizes' | 'colors', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: updated });
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      category: [],
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      sizes: [],
      colors: [],
      inStock: false,
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.inStock ||
    filters.priceMin !== priceRange.min ||
    filters.priceMax !== priceRange.max;

  return (
    <div>
      {/* Sort and Filter Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Active</span>
          )}
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm text-gray-700">Sort by:</label>
          <select
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(cat)}
                      onChange={() => toggleArrayFilter('category', cat)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleArrayFilter('sizes', size)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filters.sizes.includes(size)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Color</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleArrayFilter('colors', color)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filters.colors.includes(color)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Min: ₹{filters.priceMin}</label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.priceMin}
                    onChange={(e) => updateFilters({ priceMin: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max: ₹{filters.priceMax}</label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.priceMax}
                    onChange={(e) => updateFilters({ priceMax: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilters({ inStock: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
