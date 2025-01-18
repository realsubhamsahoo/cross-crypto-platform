import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      return {
        address,
        balance: ethers.formatEther(balance),
        signer
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask');
  }
};

export const createWallet = async () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

export const sendPayment = async (
  signer: ethers.Signer,
  recipientAddress: string,
  amount: string
) => {
  try {
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount)
    });
    return await tx.wait();
  } catch (error) {
    console.error('Error sending payment:', error);
    throw error;
  }
};