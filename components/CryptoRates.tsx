'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCryptoRates } from '@/lib/api';
import { FaEthereum, FaDollarSign } from 'react-icons/fa';
import { SiPolygon, SiTether } from 'react-icons/si';

interface CryptoRates {
  ethereum: number;
  usdt: number;
  polygon: number;
  usdc: number;
}

export default function CryptoRates() {
  const [rates, setRates] = useState<CryptoRates | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await getCryptoRates();
      setRates(data);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Live Crypto Rates</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchRates}
          disabled={loading}
          className={loading ? 'animate-spin' : ''}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 flex items-center gap-3">
            <FaEthereum className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ethereum</p>
              <p className="text-2xl font-bold">${rates?.ethereum.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-1 flex items-center gap-3">
            <SiTether className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">USDT</p>
              <p className="text-2xl font-bold">${rates?.usdt.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-1 flex items-center gap-3">
            <SiPolygon className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Polygon</p>
              <p className="text-2xl font-bold">${rates?.polygon.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-1 flex items-center gap-3">
            <FaDollarSign className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">USDC</p>
              <p className="text-2xl font-bold">${rates?.usdc.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}