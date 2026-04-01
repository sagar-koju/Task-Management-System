'use client' // Required for onChange and state

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const SearchBar = () => {
  return (
    <div className="relative w-full group">
      {/* Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      </div>

      <input type="text" placeholder="Search" className="block w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-xl 
                   text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                   focus:border-blue-500 transition-all"
      />
    </div>
  )
}

export default SearchBar