'use client';

import { useState, useEffect } from 'react';
import { Wallet, Send, RefreshCcw, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { connectWallet, sendPayment, createWallet } from '@/lib/web3';
import { getExchangeRates, convertCurrency } from '@/lib/api';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import CryptoRates from './CryptoRates';

export default function PaymentPlatform() {
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance: string;
    signer: ethers.Signer | null;
  }>({ address: '', balance: '', signer: null });
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showNewWallet, setShowNewWallet] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'ethereum' | 'polygon'>('ethereum');
  const [newWalletInfo, setNewWalletInfo] = useState<{
    address: string;
    privateKey: string;
    mnemonic: string;
  } | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        toast.error('Failed to fetch exchange rates');
      }
    };
    fetchExchangeRates();
  }, []);

  const switchChain = async (network: 'ethereum' | 'polygon') => {
    if (typeof window.ethereum !== 'undefined') {
      const chainId = network === 'ethereum' ? '0x1' : '0x89';
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      } catch (error) {
        console.error('Error switching chain:', error);
        throw error;
      }
    }
  };

  const handleConnect = async () => {
    try {
      const { address, balance, signer } = await connectWallet();
      setWalletInfo({ address, balance, signer });
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    setWalletInfo({ address: '', balance: '', signer: null });
    toast.success('Wallet disconnected');
  };

  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet();
      setNewWalletInfo({
        ...wallet,
        mnemonic: wallet.mnemonic || '',
      });      // Add this state if not already present
      // Remove duplicate state declaration and useEffect as they are already declared elsewhere
      
      // Find the Send Payment card content and update it:
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as 'ethereum' | 'polygon')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(exchangeRates).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Add this new div for converted amount display */}
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">Equivalent Amount:</p>
            <p className="text-lg font-bold">
              {selectedCurrency} {convertedAmount}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleSendPayment}
            disabled={!walletInfo.signer}
          >
            Send Payment
          </Button>
        </div>
      </CardContent>      // Add this state if not already present
      
      // Add this useEffect after other useEffects
      useEffect(() => {
        const calculateConversion = () => {
          if (!amount || !exchangeRates) return;
          const cryptoPrice = selectedNetwork === 'ethereum' 
            ? exchangeRates.ethereum 
            : exchangeRates.polygon;
          const currencyRate = exchangeRates[selectedCurrency] || 1;
          const usdValue = parseFloat(amount) * cryptoPrice;
          setConvertedAmount((usdValue * currencyRate).toFixed(2));
        };
        calculateConversion();
      }, [amount, selectedNetwork, selectedCurrency, exchangeRates]);
      
      // Find the Send Payment card content and update it:
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as 'ethereum' | 'polygon')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(exchangeRates).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Add this new div for converted amount display */}
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">Equivalent Amount:</p>
            <p className="text-lg font-bold">
              {selectedCurrency} {convertedAmount}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleSendPayment}
            disabled={!walletInfo.signer}
          >
            Send Payment
          </Button>
        </div>
      </CardContent>
      setShowNewWallet(true);
      toast.success('New wallet created successfully');
    } catch (error) {
      toast.error('Failed to create wallet');
    }
  };

  const handleSendPayment = async () => {
    if (!walletInfo.signer || !amount || !recipientAddress) {
      toast.error('Please fill in all fields and connect wallet');
      return;
    }

    try {
      const ethAmount = convertCurrency(
        parseFloat(amount),
        exchangeRates[selectedCurrency],
        1
      ).toString();

      const tx = await sendPayment(walletInfo.signer, recipientAddress, ethAmount);
      
      if (tx) {
        setTransactions([
          {
            hash: tx.hash,
            from: walletInfo.address,
            to: recipientAddress,
            amount,
            currency: selectedCurrency,
            timestamp: new Date().toISOString(),
          },
          ...transactions,
        ]);
      }

      toast.success('Payment sent successfully');
      setAmount('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Failed to send payment');
    }
  };

  const calculateConversion = (
    amount: string,
    network: 'ethereum' | 'polygon',
    currency: string,
    rates: Record<string, number>
  ) => {
    if (!amount || !rates) return '0.00';
    const cryptoPrice = network === 'ethereum' ? rates.ethereum : rates.polygon;
    const currencyRate = rates[currency] || 1;
    const usdValue = parseFloat(amount) * cryptoPrice;
    return (usdValue * currencyRate).toFixed(2);
  };

  useEffect(() => {
    const converted = calculateConversion(amount, selectedNetwork, selectedCurrency, exchangeRates);
    setConvertedAmount(converted);
  }, [amount, selectedNetwork, selectedCurrency, exchangeRates]);

  return (
    <div className="container mx-auto px-4 pt-8">
        <header className="mb-8 text-center">
      
      <nav className="flex justify-between items-center py-4 px-6 bg-white shadow-md">
        <div className="text-xl font-bold text-black">
          CROSS-CRYPTO-PLATFORM
        </div>
        <ul className="flex space-x-6 text-sm font-medium text-gray-700">
          <li className="hover:text-black">
            <a href="#home">Home</a>
          </li>
          <li className="hover:text-black">
            <a href="#about">About</a>
          </li>
          <li className="hover:text-black">
            <a href="#services">Services</a>
          </li>
          <li className="hover:text-black">
            <a href="#team">Team</a>
          </li>
          <li className="hover:text-black relative group">
            <a href="#more">More</a>
            <ul className="absolute hidden group-hover:block bg-white shadow-lg mt-2 rounded">
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#option1">Option 1</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#option2">Option 2</a>
              </li>
            </ul>
          </li>
        </ul>
        <button className="px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition-all duration-200">
          CONTACT
        </button>
      </nav>
        </header>

      <div className="px-8 lg:px-16 py-8">
  <div className="grid gap-8 md:grid-cols-2 grid-auto-rows-[minmax(0,_1fr)]">
    {/* Wallet Status Card */}
    <div className="flex flex-col">
      <Card className="h-full flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
          <CardDescription>
            {walletInfo.address ? 'Connected to MetaMask' : 'Connect your wallet to start'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {walletInfo.address ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-mono">{walletInfo.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p>{walletInfo.balance} ETH</p>
              </div>
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={handleConnect} className="w-full">
                Connect Wallet
              </Button>
              <Button onClick={handleCreateWallet} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Send Payment Card */}
    <div className="flex flex-col">
      <Card className="h-full flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Payment
          </CardTitle>
          <CardDescription>Transfer funds to any Ethereum address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Recipient Address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
  <Input
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
  />
  <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as 'ethereum' | 'polygon')}>
    <SelectTrigger className="w-32">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ethereum">Ethereum</SelectItem>
      <SelectItem value="polygon">Polygon</SelectItem>
    </SelectContent>
  </Select>
  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
    <SelectTrigger className="w-32">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Object.keys(exchangeRates).map((currency) => (
        <SelectItem key={currency} value={currency}>
          {currency}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
<div className="p-4 bg-gray-100 rounded-md">
  <p className="text-sm text-gray-600">Converted Amount:</p>
  <p className="text-lg font-bold">
    {selectedCurrency} {convertedAmount}
  </p>
</div>
            <Button
  className="w-full"
  onClick={async () => {
    try {
      await switchChain(selectedNetwork);
      await handleSendPayment();
    } catch (error) {
      toast.error('Failed to send payment');
    }
  }}
  disabled={!walletInfo.signer}
>
  Send Payment
</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

        <div className="md:col-span-2 lg:col-span-1 px-[4rem]">
          <CryptoRates />
        </div>


<Card className="mt-8 mx-[4rem]">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <History className="h-5 w-5" />
      Transaction History
    </CardTitle>
    <CardDescription>Your recent payment activities</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">From</th>
            <th className="text-left py-2">To</th>
            <th className="text-left py-2">Amount</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              timestamp: Date.now(),
              from: '0x1234567890abcdef',
              to: '0xfedcba0987654321',
              amount: 0.5,
              currency: 'ETH',
              status: 'Completed',
            },
            {
              timestamp: Date.now() - 86400000,
              from: '0xabcdef1234567890',
              to: '0x1234567890abcdef',
              amount: 1.25,
              currency: 'ETH',
              status: 'Completed',
            },
            {
              timestamp: Date.now() - 172800000,
              from: '0x9876543210fedcba',
              to: '0xabcdef1234567890',
              amount: 2,
              currency: 'ETH',
              status: 'Completed',
            },
            {
              timestamp: Date.now() - 259200000,
              from: '0x1122334455667788',
              to: '0x876543210fedcba9',
              amount: 0.75,
              currency: 'ETH',
              status: 'Completed',
            },
            {
              timestamp: Date.now() - 345600000,
              from: '0xaabbccddeeff0011',
              to: '0x9988776655443322',
              amount: 0.95,
              currency: 'ETH',
              status: 'Completed',
            },
          ].map((tx, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{new Date(tx.timestamp).toLocaleDateString()}</td>
              <td className="py-2 font-mono">{tx.from.slice(0, 8)}...</td>
              <td className="py-2 font-mono">{tx.to.slice(0, 8)}...</td>
              <td className="py-2">
                {tx.amount} {tx.currency}
              </td>
              <td className="py-2">
                <span className="text-green-500">{tx.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

    <footer className="border-2 border-gray-200 py-6 bg-white mt-20 mb-2 rounded-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Section: Links */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <a
            href="https://github.com/your-username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/your-username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            LinkedIn
          </a>
        </div>

        {/* Center Section: Copyright */}
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Cross-Border Pay. All rights reserved.
        </div>

        {/* Right Section: Policies */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <a
            href="/privacy-policy"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-and-conditions"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>

      <Dialog open={showNewWallet} onOpenChange={setShowNewWallet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Wallet Created</DialogTitle>
            <DialogDescription>
              Please save this information securely. You will not be able to recover it if lost.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="font-mono break-all">{newWalletInfo?.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Private Key</p>
              <p className="font-mono break-all">{newWalletInfo?.privateKey}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mnemonic Phrase</p>
              <p className="font-mono break-all">{newWalletInfo?.mnemonic}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
const [convertedAmount, setConvertedAmount] = useState('0.00');