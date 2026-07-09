import { useState, useEffect } from 'react';
import { Button, Card, CardContent } from '@repo/ui';
import { formatDate, formatCurrency } from '@repo/utils';
import type { Estate, PaginatedResponse, HealthResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export function App() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [estatesRes, healthRes] = await Promise.all([
          fetch(`${API_URL}/estates`),
          fetch(`${API_URL}/health`),
        ]);

        const estatesData: PaginatedResponse<Estate> = await estatesRes.json();
        const healthData: HealthResponse = await healthRes.json();

        setEstates(estatesData.data);
        setHealth(healthData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">EstateRent</h1>
          {health && (
            <span className="text-sm text-gray-500">
              API: {health.status} &middot; Uptime: {Math.round(health.uptime)}s
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Available Properties</h2>
          <p className="text-gray-500">Browse our curated collection of rental properties.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {estates.map((estate) => (
            <Card key={estate.id}>
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={estate.images[0]}
                  alt={estate.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{estate.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{estate.location}</p>
                <p className="text-sm text-gray-600 mb-3">{estate.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(estate.price)}/mo
                  </span>
                  <Button size="sm">View Details</Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Listed {formatDate(estate.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
