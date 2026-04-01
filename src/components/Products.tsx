import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PackageOpen, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { Product } from '../types/product';
import ProductDetails from './ProductDetails';

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 800;
const PAGE_SIZE = 12;

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

async function fetchPageWithRetry(
    page: number,
    cat: string | undefined,
    srch: string | undefined,
    signal: AbortSignal,
): Promise<Awaited<ReturnType<typeof api.fetchProducts>>> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (attempt > 0) {
            await new Promise(r => setTimeout(r, RETRY_BASE_MS * 2 ** (attempt - 1)));
            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        }
        try {
            return await api.fetchProducts({ page, limit: PAGE_SIZE, category: cat, search: srch });
        } catch (err) {
            if (attempt === MAX_RETRIES - 1) throw err;
        }
    }
    throw new Error('Unreachable');
}

function Products({ category, search }: ProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Reset & load page 1 whenever filters change
    const loadFirstPage = useCallback(async (cat?: string, srch?: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);
        setRetrying(false);
        setProducts([]);
        setPage(1);

        try {
            setRetrying(false);
            const response = await fetchPageWithRetry(1, cat, srch, controller.signal);
            if (controller.signal.aborted) return;
            setProducts(response.data);
            setTotalPages(response.totalPages);
        } catch (err) {
            if (controller.signal.aborted) return;
            if ((err as DOMException).name !== 'AbortError') {
                setError(String(err));
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
                setRetrying(false);
            }
        }
    }, []);

    // Append next page (triggered by IntersectionObserver)
    const loadNextPage = useCallback(async (nextPage: number, cat?: string, srch?: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoadingMore(true);
        setError(null);

        try {
            const response = await fetchPageWithRetry(nextPage, cat, srch, controller.signal);
            if (controller.signal.aborted) return;
            setProducts(prev => [...prev, ...response.data]);
            setPage(nextPage);
            setTotalPages(response.totalPages);
        } catch (err) {
            if (controller.signal.aborted) return;
            if ((err as DOMException).name !== 'AbortError') {
                setError(String(err));
            }
        } finally {
            if (!controller.signal.aborted) setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadFirstPage(category, search);
        return () => abortRef.current?.abort();
    }, [category, search]);

    // IntersectionObserver watches the sentinel div at the bottom
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !loading &&
                    !loadingMore &&
                    !error &&
                    page < totalPages
                ) {
                    loadNextPage(page + 1, category, search);
                }
            },
            { rootMargin: '200px' },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loading, loadingMore, error, page, totalPages, category, search, loadNextPage]);

    const handleRetry = () => {
        if (products.length === 0) {
            loadFirstPage(category, search);
        } else {
            loadNextPage(page + 1, category, search);
        }
    };

    const hasProducts = products.length > 0;
    const isInitialLoad = loading && !hasProducts;
    const isEmpty = !loading && !error && !hasProducts;
    const hasMore = page < totalPages;

    return (
        <div className="w-full p-6">
            {/* Error banner */}
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

            {/* Skeleton grid — initial load only */}
            {isInitialLoad && (
                <div
                    className="grid w-full gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
                >
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            )}

            {/* Product grid */}
            {hasProducts && (
                <div
                    className="grid w-full gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
                >
                    {products.map((product: Product) => (
                        <ProductDetails key={product.id} product={product} />
                    ))}

                    {/* Inline skeletons for next page loading */}
                    {loadingMore && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <ProductSkeleton key={`more-${i}`} />
                    ))}
                </div>
            )}

            {/* Sentinel — observed to trigger next page load */}
            <div ref={sentinelRef} className="h-1" />

            {/* End of results */}
            {hasProducts && !hasMore && !loading && !loadingMore && (
                <p className="mt-8 text-center text-sm text-gray-400">
                    All {products.length} products loaded
                </p>
            )}
        </div>
    );
}

export default React.memo(Products)