import React from 'react'
import type { Product } from '../types/product';

function ProductDetails({ product }: { product: Product }) {
    return (
        <div key={product?.id} className="overflow-hidden flex flex-col min-w-[210px]">
            <img
                src={product?.imageUrl}
                alt={product?.name}
                loading="lazy"
                decoding="async"
                className="w-full h-[210px] object-cover rounded-t-[6px] rounded-b-[4px]"
            />
            <div className="p-2 flex flex-col gap-2">
                <div>
                    <p className="text-sm font-normal line-clamp-2 flex-1 tracking-normal text-[#5A6573]">{product?.category}</p>
                    <h4 className="text-base font-medium line-clamp-2 flex-1 text-[#1A2B3D]">{product?.name}</h4>
                </div>
                <h3 className="text-xl font-medium text-[#1882FF]">${product?.price}</h3>
            </div>
        </div>
    )
}

export default React.memo(ProductDetails)