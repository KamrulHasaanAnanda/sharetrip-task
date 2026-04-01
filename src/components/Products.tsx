import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { Product } from '../types/product';
import ProductDetails from './ProductDetails';
import ProductSkeleton from './ProductSkeleton';
import Empty from './Empty';
import ErrorBanner from './ErrorBanner';

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 800;
const PAGE_SIZE = 12;

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
    const abortRef = useRef<AbortController | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadFirstPage = useCallback(async (cat?: string, srch?: string) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);
        setProducts([]);
        setPage(1);

        try {
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
            }
        }
    }, []);

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
            {error && !hasProducts && (
                <ErrorBanner handleRetry={handleRetry} />
            )}

            {isEmpty && (
                <Empty />
            )}

            {isInitialLoad && (
                <div
                    className="grid w-full gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
                >
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            )}

            {hasProducts && (
                <div
                    className="grid w-full gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
                >
                    {products.map((product: Product) => (
                        <ProductDetails key={product.id} product={product} />
                    ))}
                    {loadingMore && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <ProductSkeleton key={`more-${i}`} />
                    ))}
                </div>
            )}

            <div ref={sentinelRef} className="h-1" />

            {error && hasProducts && (

                <ErrorBanner handleRetry={handleRetry} />

            )}

            {hasProducts && !hasMore && !loading && !loadingMore && (
                <p className="mt-8 text-center text-sm text-gray-400">
                    All {products.length} products loaded
                </p>
            )}
        </div>
    );
}

export default React.memo(Products)