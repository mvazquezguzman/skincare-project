'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { useOutsideClick } from '@/hooks/use-outside-click';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  productBrand: string;
  productName: string;
  price: number;
  description: string | null;
  imgURL: string | null;
  productURL: string | null;
  categoryName: string | null;
}

type SortOption = 'default' | 'price-low-high' | 'price-high-low' | 'brand-name';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(50);
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const batchSize = 1000; // Supabase default limit
      let allProducts: Product[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from('all_products')
          .select('id, productBrand, productName, price, description, imgURL, productURL, categoryName')
          .order('created_at', { ascending: false })
          .range(offset, offset + batchSize - 1);
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (data && data.length > 0) {
          allProducts = [...allProducts, ...(data as Product[])];
          
          if (data.length < batchSize) {
            hasMore = false;
          } else {
            offset += batchSize;
          }
        } else {
          hasMore = false;
        }
      }
      
      setProducts(allProducts);
      
      const excludedCategories = ['Body Lotions & Body Oils', 'Color Correct', 'Face Wipes'];
      const uniqueCategories = Array.from(
        new Set(
          allProducts
            .map(p => p.categoryName)
            .filter((cat): cat is string => 
              cat !== null && 
              cat !== undefined && 
              !excludedCategories.includes(cat)
            )
            .sort()
        )
      );
      setCategories(uniqueCategories);
      setFilteredProducts(allProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by selected categories
  useEffect(() => {
    if (selectedCategories.size === 0) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.categoryName && selectedCategories.has(product.categoryName)
      );
      setFilteredProducts(filtered);
    }
    setCurrentPage(1);
  }, [selectedCategories, products]);

  // Sorting function
  const sortProducts = (products: Product[], sortOption: SortOption): Product[] => {
    const sorted = [...products];
    
    switch (sortOption) {
      case 'price-low-high':
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-high-low':
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case 'brand-name':
        return sorted.sort((a, b) => {
          const brandA = a.productBrand.toLowerCase();
          const brandB = b.productBrand.toLowerCase();
          if (brandA < brandB) return -1;
          if (brandA > brandB) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  };

  // Handle sort change
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle category filter toggle
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  // Update displayed products when sorted products or page changes
  useEffect(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const currentProducts = sortedProducts.slice(start, end);
    console.log('Displayed products:', currentProducts.length, 'Sorted products:', sortedProducts.length);
    setDisplayedProducts(currentProducts);
  }, [sortedProducts, currentPage, productsPerPage]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update sorted products when filtered products or sort changes
  useEffect(() => {
    const sorted = sortProducts(filteredProducts, sortBy);
    setSortedProducts(sorted);
  }, [filteredProducts, sortBy]);

  // Handle product click to expand
  const handleProductClick = (product: Product) => {
    setExpandedProduct(expandedProduct?.id === product.id ? null : product);
  };

  // Close expanded product on ESC key and manage body overflow
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setExpandedProduct(null);
      }
    }

    if (expandedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [expandedProduct]);

  useOutsideClick(ref, () => setExpandedProduct(null));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load products. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">All Skincare Products</h1>
      
      <p className="text-gray-600 mb-4 md:mb-8 text-sm md:text-base">
        Search and filter thorught all the skincare products.
      </p>
      
      {/* Product Count */}
      <div className="mb-2 md:mb-4">
        <p className="text-xs md:text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
          {selectedCategories.size > 0 && ` (${products.length} total)`}
        </p>
      </div>
      
      {/* Category Filters */}
      <div className="mb-3 md:mb-6">
        <div className="flex flex-nowrap md:flex-wrap gap-1.5 md:gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                selectedCategories.has(category)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <span className="text-xs md:text-sm font-medium text-gray-700">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="brand-name">Brand Name</SelectItem>
              <SelectItem value="price-low-high">Low to High</SelectItem>
              <SelectItem value="price-high-low">High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Mobile List Layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {displayedProducts.length > 0 ? displayedProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left w-full flex gap-4 p-4"
          >
            <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={product.imgURL || '/placeholder.jpg'} 
                alt={product.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs mb-1 font-medium">{product.productBrand}</p>
              <h3 className="font-semibold text-base mb-1 line-clamp-2">
                {product.productName}
              </h3>
              <p className="text-lg font-bold text-green-600 mb-2">
                ${Number(product.price).toFixed(2)}
              </p>
              {product.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </button>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {displayedProducts.length > 0 ? displayedProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left w-full flex flex-col"
          >
            <div className="aspect-square bg-gray-200 overflow-hidden relative w-full flex-shrink-0">
              <img 
                src={product.imgURL || '/placeholder.jpg'} 
                alt={product.productName}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-2 font-medium">{product.productBrand}</p>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.productName}
              </h3>
              <p className="text-xl font-bold text-green-600 mb-3">
                ${Number(product.price).toFixed(2)}
              </p>
              {product.description && (
                <p className="text-sm text-gray-500 line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>
          </button>
        )) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}
      </div>

      {/* Expanded Product Modal */}
      <AnimatePresence>
        {expandedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedProduct ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${expandedProduct.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white rounded-full h-8 w-8 z-50 shadow-lg hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedProduct(null)}
              aria-label="Close"
            >
              X
            </motion.button>

            <motion.div
              layoutId={`card-${expandedProduct.id}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${expandedProduct.id}-${id}`}>
                <img
                  width={200}
                  height={200}
                  src={expandedProduct.imgURL || '/placeholder.jpg'}
                  alt={expandedProduct.productName}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${expandedProduct.id}-${id}`}
                      className="font-bold text-neutral-700"
                    >
                      {expandedProduct.productName}
                    </motion.h3>
                    <p className="text-neutral-600 text-sm mt-1">
                      {expandedProduct.productBrand}
                    </p>
                    <motion.p
                      layoutId={`price-${expandedProduct.id}-${id}`}
                      className="text-2xl font-bold text-green-600 mt-2"
                    >
                      ${Number(expandedProduct.price).toFixed(2)}
                    </motion.p>
                  </div>
                </div>
                {expandedProduct.description && (
                  <div className="pt-4 relative px-4">
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                    >
                      <p className="whitespace-pre-wrap">{expandedProduct.description}</p>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      
      {displayedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}

