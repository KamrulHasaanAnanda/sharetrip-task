import React from 'react'

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
    )
}

export default ProductSkeleton