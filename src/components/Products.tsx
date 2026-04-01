import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PackageOpen, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { Product } from '../types/product';
import ProductDetails from './ProductDetails';

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 800;

function ProductSkeleton() {
    return (
        <div className="overflow-hidden flex flex-col min-w-[210px] animate-pulse">
            <div className="w-full h-[210px] bg-gray-200 rounded-t-[6px] rounded-b-[4px]" />
            <div className="p-2 flex flex-col gap-2">
                <div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
        </div>
    );
}

interface ProductsProps {
    category?: string;
    search?: string;
}

function Products({ category, search }: ProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const fetchWithRetry = useCallback(async (cat?: string, srch?: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const hasStaleData = products.length > 0;
        if (!hasStaleData) setLoading(true);
        setError(null);
        setRetrying(false);

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (controller.signal.aborted) return;

            if (attempt > 0) {
                setRetrying(true);
                await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** (attempt - 1)));
                if (controller.signal.aborted) return;
            }

            try {
                const response = await api.fetchProducts({
                    page: 1, limit: 12, category: cat, search: srch,
                });
                if (controller.signal.aborted) return;
                setProducts(response.data);
                setError(null);
                setRetrying(false);
                setLoading(false);
                return;
            } catch (err) {
                if (controller.signal.aborted) return;
                if (attempt === MAX_RETRIES - 1) {
                    setError(String(err));
                    if (!hasStaleData) setProducts([]);
                }
            }
        }
        setRetrying(false);
        setLoading(false);
    }, [products.length]);

    useEffect(() => {
        fetchWithRetry(category, search);
        return () => abortRef.current?.abort();
    }, [category, search]);

    const handleRetry = () => fetchWithRetry(category, search);

    const hasProducts = products.length > 0;
    const isInitialLoad = loading && !hasProducts;
    const isEmpty = !loading && !error && !hasProducts;

    return (
        <div className="w-full p-6">
            {/* Error banner — shown above stale data or standalone */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-6">
                    <AlertTriangle size={20} className="shrink-0 text-red-500" />
                    <p className="flex-1 text-sm text-red-700">
                        Something went wrong.{hasProducts ? ' Showing previously loaded results.' : ''}
                    </p>
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Retry
                    </button>
                </div>
            )}

            {/* Retrying indicator */}
            {retrying && !error && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <RefreshCw size={14} className="animate-spin" />
                    Retrying…
                </div>
            )}

            {/* Empty state */}
            {isEmpty && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-5">
                        <PackageOpen size={36} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                        Try changing the category or adjusting your search terms.
                    </p>
                </div>
            )}

            {/* Skeleton grid (initial load only) */}
            {isInitialLoad && (
                <div
                    className="grid w-full gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
                >
                    {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            )}

            {/* Product grid — stays visible during re-fetches */}
            {hasProducts && (
                <div
                    className={`grid w-full gap-6 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
                >
                    {products.map((product: Product) => (
                        <ProductDetails key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default React.memo(Products)