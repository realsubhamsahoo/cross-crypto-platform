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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Cross-Border Payments</h1>
        <p className="text-muted-foreground">Fast, secure blockchain payments across borders</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-1">
          <Card>
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

        <div className="md:col-span-2 lg:col-span-1">
          <Card>
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

        <div className="md:col-span-2 lg:col-span-1">
          <CryptoRates />
        </div>
      </div>

      <Card className="mt-8">
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
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td className="py-2 font-mono">{tx.from.slice(0, 8)}...</td>
                    <td className="py-2 font-mono">{tx.to.slice(0, 8)}...</td>
                    <td className="py-2">
                      {tx.amount} {tx.currency}
                    </td>
                    <td className="py-2">
                      <span className="text-green-500">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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