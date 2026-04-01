import { AlertTriangle, RefreshCw } from 'lucide-react'
import React from 'react'

function ErrorBanner({ handleRetry }: { handleRetry: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 py-10 mt-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                <AlertTriangle size={22} className="text-red-400" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-800">Failed to load more products</p>
                <p className="text-xs text-gray-400 mt-0.5">The server ran into an issue. Give it another shot.</p>
            </div>
            <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
                <RefreshCw size={14} />
                Try again
            </button>
        </div>
    )
}

export default React.memo(ErrorBanner)