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
import Link from 'next/link';
import transactionsData from '../public/transactions.json';
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
      setNewWalletInfo(wallet);
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

      toast.success('Payment sent successfully');
      setAmount('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Failed to send payment');
    }
  };

  return (
  <div className="container mx-auto px-4 pt-8">
  <header className="mb-8 text-center">
  <nav className="fixed top-0 left-0 w-full py-4 px-6 bg-white shadow-md rounded-md border-b-2 z-50">
    <div className="flex justify-between items-center">
      <div className="text-xl font-bold text-black">
        <img src='/logo.webp' height={70} width={70} alt="Logo" />
      </div>
      <ul className="flex space-x-6 text-sm font-medium text-gray-700">
        <li className="hover:text-black">
          <a href="/">Home</a>
        </li>
        <li className="hover:text-black">
          <Link href="/about-team">About</Link>
        </li>
        <li className="hover:text-black">
          <Link href="/about-team">Team</Link>
        </li>
      </ul>
      <button className="px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition-all duration-200">
        CONTACT
      </button>
    </div>
  </nav>
</header>

  <div className="px-8 lg:px-16 py-8 mt-20">
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
            <Button
              className="w-full"
              onClick={handleSendPayment}
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

        <div className="md:col-span-2 lg:col-span-1 px-[2rem] md:px-[4rem] ">
          <CryptoRates />
        </div>


<Card className="mt-8 mx-[2rem] md:mx-[4rem]">
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
          {transactionsData.length > 0 ? (
            transactionsData.map((tx, index) => (
              <tr key={index} className="border-b">
                {/* <td className="py-2">{new Date(tx.timestamp).toLocaleDateString()}</td> */}
                <td className="py-2 font-mono">{tx.from.slice(0, 8)}...</td>
                <td className="py-2 font-mono">{tx.to.slice(0, 8)}...</td>
                <td className="py-2">
                  {tx.amount} {tx.currency}
                </td>
                <td className="py-2">
                  <span className="text-green-500">{tx.status}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-4 text-center">No transactions found</td>
            </tr>
          )}
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