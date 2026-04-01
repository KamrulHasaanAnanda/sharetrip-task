import React from 'react'
import { PackageOpen } from 'lucide-react';

function Empty() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-5">
                <PackageOpen size={36} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
            <p className="text-sm text-gray-500 max-w-xs">
                Try changing the category or adjusting your search terms.
            </p>
        </div>
    )
}

export default React.memo(Empty)