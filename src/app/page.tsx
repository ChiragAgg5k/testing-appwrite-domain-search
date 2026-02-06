'use client';

import { useState, useEffect, useCallback } from 'react';

interface DomainSuggestion {
  domain: string;
  price: number;
  available: boolean;
  premium: boolean;
}

interface ApiResponse {
  total: number;
  suggestions: DomainSuggestion[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [tld, setTld] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchDomains = useCallback(async (searchQuery: string, searchTld: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/domains', window.location.origin);
      url.searchParams.append('query', searchQuery);
      if (searchTld) {
        url.searchParams.append('tld', searchTld);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setResults(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domain suggestions');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDomains(query, tld);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, tld, searchDomains]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-white">
          Domain Search
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Find the perfect domain name for your project
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain Name
              </label>
              <div className="relative">
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter domain name (e.g., chiragaggarwakl)"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:w-32">
              <label htmlFor="tld" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TLD
              </label>
              <select
                id="tld"
                value={tld}
                onChange={(e) => setTld(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">All TLDs</option>
                <option value="tech">.tech</option>
                <option value="com">.com</option>
                <option value="net">.net</option>
                <option value="org">.org</option>
                <option value="io">.io</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Available Domains ({results.length})
            </h2>
            <div className="grid gap-4">
              {results.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {suggestion.domain}
                      </h3>
                      {suggestion.premium && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${suggestion.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {suggestion.available ? '✓ Available' : '✗ Not Available'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${suggestion.price != null ? suggestion.price.toFixed(2) : 'N/A'}
                    </span>
                    {suggestion.price != null && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">/year</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && !error && query && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No domain suggestions found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
