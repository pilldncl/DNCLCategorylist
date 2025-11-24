'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import ModernHeader from '@/components/ModernHeader';
import CategoryNavigation from '@/components/CategoryNavigation';
import BannerCarousel from '@/components/BannerCarousel';
import FeaturedProducts from '@/components/FeaturedProducts';
import HeroSection from '@/components/HeroSection';
import { ReviewsComingSoon, RecommendationsComingSoon } from '@/components/ComingSoonSections';
import LiveChat from '@/components/LiveChat';
import ShoppingCart from '@/components/ShoppingCart';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePageContent() {
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Banner state
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  
  // Featured products state
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [allProductsForFeatured, setAllProductsForFeatured] = useState<CatalogItem[]>([]);
  
  const { trackPageView } = useAnalyticsTracking();

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      setBannersLoading(true);
      const response = await fetch('/api/banners');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.banners) {
          setBanners(data.banners);
        }
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setBannersLoading(false);
    }
  }, []);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setFeaturedLoading(true);
      const response = await fetch('/api/featured');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.featured) {
          setFeaturedProducts(data.featured);
        }
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  // Fetch all products for featured products
  const fetchAllProductsForFeatured = useCallback(async () => {
    try {
      const response = await fetch('/api/catalog?limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          setAllProductsForFeatured(data.items);
        }
      }
    } catch (error) {
      console.error('Error fetching all products for featured:', error);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchAllProductsForFeatured();
    trackPageView();
  }, [fetchBanners, fetchFeaturedProducts, fetchAllProductsForFeatured, trackPageView]);

  const handleSearch = (query: string) => {
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleShopClick = () => {
    router.push('/products');
  };

  const handleImageClick = (item: CatalogItem) => {
    router.push(`/products/${item.id}`);
  };

  const handleInquiry = async (type: 'email' | 'whatsapp', item: CatalogItem) => {
    // Inquiry handling - can navigate to product page or open contact
    router.push(`/products/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <ModernHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Category Navigation */}
      <CategoryNavigation />

      {/* Hero Section - Simplified */}
      <HeroSection onShopClick={handleShopClick} />

      {/* Banner Carousel - Primary Promotional Area (Admin-Editable) */}
      {!bannersLoading && banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BannerCarousel 
            banners={banners} 
            autoPlay={true} 
            autoPlayInterval={5000}
          />
        </div>
      )}

      {/* Featured Products Section */}
      {!featuredLoading && featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FeaturedProducts
            featuredList={featuredProducts}
            products={allProductsForFeatured}
            onImageClick={handleImageClick}
            onInquiry={handleInquiry}
          />
        </div>
      )}

      {/* Coming Soon Sections */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReviewsComingSoon />
          <div className="mt-12">
            <RecommendationsComingSoon 
              featuredProducts={(featuredProducts
                .map(featured => allProductsForFeatured.find(p => p.id === featured.productId))
                .filter(Boolean) as CatalogItem[])
                .slice(0, 4)
              } 
            />
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <ShoppingCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Live Chat */}
      <LiveChat />
    </div>
  );
}

