'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { sha256 } from 'js-sha256';
import { Alchemy, Network } from 'alchemy-sdk';

const DepositOptions = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'bank' | 'card' | 'crypto'>('bank');
  const [amount, setAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Add transaction tracking state
  const [transactionHash, setTransactionHash] = useState('');
  const [depositedAmount, setDepositedAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('Waiting for deposit');
  const [copied, setCopied] = useState(false); // For copy feedback
  
  // Add central wallet transfer tracking
  const [transferToCentralStatus, setTransferToCentralStatus] = useState('Pending');
  const [centralTransferHash, setCentralTransferHash] = useState('');
  
  // Helper function to generate deterministic private key from user ID
  const generateDeterministicPrivateKey = (userId: string): string => {
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Invalid user ID');
    }
    
    // Create deterministic seed
    const passcode = process.env.NEXT_PUBLIC_WALLET_PASSCODE || 'default-secure-passcode-2024';
    const salt = 'TokenizeHub-Wallet-Generation';
    const combinedString = `${salt}-${userId}-${passcode}`;
    
    // Generate hash
    const hash = sha256(combinedString);
    
    // Validate hash
    if (hash.length !== 64) {
      throw new Error('Hash generation failed');
    }
    
    return '0x' + hash;
  };

  // Function to generate wallet from userId using deterministic private key
  const generateWallet = () => {
    if (!session?.user?.id) {
      alert('You must be logged in to generate a wallet address');
      return;
    }
    
    setIsGenerating(true);
    
    // Reset all transaction states
    setTransactionHash('');
    setDepositedAmount('');
    setTransactionStatus('Waiting for deposit');
    setTransferToCentralStatus('Pending');
    setCentralTransferHash('');
    
    try {
      const userId = session.user.id;
      
      console.log('Generating deterministic wallet for user ID:', userId.substring(0, 8) + '...');
      
      // Generate deterministic private key
      const privateKey = generateDeterministicPrivateKey(userId);
      
      // Generate wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      console.log('Generated wallet address:', wallet.address);
      console.log('This address will always be the same for this user');
      
      // Set the wallet address
      setCryptoWallet(wallet.address);
      setShowQRCode(true);
      
    } catch (error) {
      console.error('Error generating wallet:', error);
      alert('Failed to generate wallet address. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add blockchain monitoring effect
  useEffect(() => {
    if (!cryptoWallet || !showQRCode) return;
    
    const usdtContractAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    console.log('Monitoring started for wallet:', cryptoWallet);
    console.log('USDT contract address:', usdtContractAddress);
    
    // Function to save transaction to database
    const saveTransactionToDatabase = async (txHash: string, amount: string) => {
      if (!session?.user?.id) {
        console.error('Cannot save transaction: User not logged in');
        return;
      }
      
      try {
        console.log('Saving transaction to database...');
        const response = await fetch('/api/transactions/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            transactionHash: txHash,
            amount: amount,
            currency: 'USDT',
            method: 'crypto',
            timestamp: new Date().toISOString(),
          }),
        });
        
        if (response.ok) {
          console.log('Transaction saved to database successfully');
        } else {
          console.error('Failed to save transaction to database:', await response.text());
        }
      } catch (error) {
        console.error('Error saving transaction to database:', error);
      }
    };
    
    // Configure Alchemy
    const alchemyInstance = new Alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
      network: Network.MATIC_MAINNET,
    });
    console.log('Alchemy instance created with network:', Network.MATIC_MAINNET);
    
    // Set up transfer event filter
    const transferEventSignature = 'Transfer(address,address,uint256)';
    const transferEventTopic = ethers.id(transferEventSignature);
    console.log('Transfer event topic:', transferEventTopic);
    
    // Monitor for USDT transfer events directly
    const monitorTransferEvents = async () => {
      try {
        console.log('Setting up transfer event monitoring...');
        
        // Create a filter for Transfer events where the recipient is our wallet
        const filter = {
          address: usdtContractAddress,
          topics: [
            transferEventTopic,
            null, // from address (any)
            ethers.zeroPadValue(cryptoWallet.toLowerCase(), 32) // to address (our wallet)
          ]
        };
        
        console.log('Created filter:', filter);
        
        // Listen for logs matching our filter
        // Add this constant at the top with other imports
        const CENTRAL_WALLET = '0x14Bb4214E10b9e2EA352E29dD973B3Df370f9B4C';
        
        // Make the callback function async
        alchemyInstance.ws.on(filter, async (log) => {
          console.log('Received transfer event log:', log);
          
          try {
            // Parse the Transfer event
            const erc20Interface = new ethers.Interface([
              "event Transfer(address indexed from, address indexed to, uint256 value)"
            ]);
            
            const parsedLog = erc20Interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            
            console.log('Parsed log:', parsedLog);
            
            if (parsedLog) {
              const from = parsedLog.args[0];
              const to = parsedLog.args[1];
              const value = parsedLog.args[2];
              
              console.log('Transfer from:', from);
              console.log('Transfer to:', to);
              console.log('Transfer value (raw):', value.toString());
              
              // Verify this is a transfer to our wallet
              if (to.toLowerCase() === cryptoWallet.toLowerCase()) {
                console.log('Confirmed transfer to our wallet!');
                
                const formattedAmount = ethers.formatUnits(value, 6); // USDT has 6 decimals
                console.log('Formatted amount:', formattedAmount, 'USDT');
                
                setTransactionHash(log.transactionHash);
                setDepositedAmount(formattedAmount);
                setTransactionStatus('Deposited');
                console.log('Transaction status updated to Deposited');
                
                // Save transaction to database
                await saveTransactionToDatabase(log.transactionHash, formattedAmount);
                
                // Transfer to central wallet
                try {
                  console.log('Starting transfer to central wallet...');
                  setTransferToCentralStatus('Transferring');
                  
                  // Create wallet instance using the deterministic helper function
                  const userId = session?.user?.id;
                  
                  if (!userId) {
                    throw new Error('User ID not available for wallet recreation');
                  }
                  
                  // Use the helper function to generate the same deterministic private key
                  const privateKey = generateDeterministicPrivateKey(userId);
                  
                  // Create provider for Polygon mainnet
                  const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
                  const wallet = new ethers.Wallet(privateKey, provider);
                  console.log('Wallet instance recreated for transfer using helper function');
                  
                  // Verify the wallet address matches what we generated earlier
                  if (wallet.address.toLowerCase() !== cryptoWallet.toLowerCase()) {
                    console.error('Wallet address mismatch!');
                    console.error('Expected:', cryptoWallet);
                    console.error('Generated:', wallet.address);
                    throw new Error('Wallet address mismatch during transfer');
                  }
                  
                  // USDT contract interface
                  const usdtInterface = new ethers.Interface([
                    "function transfer(address to, uint256 value) returns (bool)",
                    "function balanceOf(address account) view returns (uint256)"
                  ]);
                  console.log('USDT interface created');
                  
                  // Create contract instance
                  const usdtContract = new ethers.Contract(
                    usdtContractAddress,
                    usdtInterface,
                    wallet
                  );
                  console.log('USDT contract instance created');
                  
                  // Check wallet balance first
                  const balance = await usdtContract.balanceOf(cryptoWallet);
                  console.log('Current wallet balance:', ethers.formatUnits(balance, 6), 'USDT');
                  
                  if (balance > 0) {
                    console.log('Initiating transfer to central wallet:', CENTRAL_WALLET);
                    console.log('Amount to transfer:', ethers.formatUnits(balance, 6), 'USDT');
                    
                    // Transfer entire balance to central wallet
                    const tx = await usdtContract.transfer(CENTRAL_WALLET, balance);
                    
                    console.log('Transfer transaction created:', tx.hash);
                    setCentralTransferHash(tx.hash);
                    console.log('Waiting for transaction confirmation...');
                    
                    // Wait for confirmation
                    const receipt = await tx.wait();
                    console.log('Transfer confirmed in block:', receipt.blockNumber);
                    console.log('Gas used:', receipt.gasUsed.toString());
                    console.log('Transfer to central wallet completed successfully');
                    
                    setTransferToCentralStatus('Completed');
                  } else {
                    console.log('No balance to transfer');
                    setTransferToCentralStatus('No balance');
                  }
                } catch (error: unknown) {
                  console.error('Error transferring to central wallet:', error);
                  setTransferToCentralStatus('Failed');
                  
                  // Type guard for error object with reason property
                  if (error && typeof error === 'object' && 'reason' in error) {
                    console.error('Error reason:', (error as { reason: string }).reason);
                  }
                  // Type guard for error object with code property
                  if (error && typeof error === 'object' && 'code' in error) {
                    console.error('Error code:', (error as { code: string | number }).code);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error parsing transfer event:', error);
          }
        });
        
      } catch (error) {
        console.error('Error setting up event monitoring:', error);
      }
    };
    
    monitorTransferEvents();
    console.log('Transfer event monitoring initialized');
    
    return () => {
      console.log('Cleaning up blockchain listeners');
      alchemyInstance.ws.removeAllListeners();
    };
  }, [cryptoWallet, showQRCode, session]);

  const handleCopyToClipboard = () => {
    if (cryptoWallet) {
      navigator.clipboard.writeText(cryptoWallet).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
      }, (err) => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy address. Please copy it manually.');
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'crypto') {
      generateWallet();
    } else {
      // Handle other deposit methods
      console.log({ amount, paymentMethod: activeTab });
      alert(`Deposit of $${amount} via ${activeTab} initiated!`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-[#695936] mb-6">Deposit Funds</h2>
      
      {/* Payment Method Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'bank' ? 'text-[#695936] border-b-2 border-[#695936]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('bank')}
        >
          Bank Transfer
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'card' ? 'text-[#695936] border-b-2 border-[#695936]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('card')}
        >
          Credit Card
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'crypto' ? 'text-[#695936] border-b-2 border-[#695936]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('crypto')}
        >
          Crypto
        </button>
      </div>

      {/* Amount Field (Common for all methods) */}
 

      {/* Payment Method Specific Forms */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
              placeholder="Your Bank Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
              placeholder="1234567890"
              required
            />
          </div>
        </div>
      )}

      {activeTab === 'card' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">Secure Payment</span>
            </div>
            <p className="text-xs text-gray-500">
              Your payment information is processed securely through Stripe. We never store your card details.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
            <div className="p-3 border rounded-lg bg-white" id="stripe-card-element">
              {/* Stripe Card Element will be mounted here */}
              <div className="h-10 flex items-center justify-center text-sm text-gray-500">
                Stripe payment form will appear here
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We accept Visa, Mastercard, American Express, and Discover
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder="John Doe" required />
          </div>
          {/* Stripe element placeholder */}
          <div className="p-3 border rounded-lg bg-white" id="stripe-card-element">
             <div className="h-10 flex items-center justify-center text-sm text-gray-500">Stripe form mounts here</div>
          </div>
          <button type="submit" className="w-full mt-4 bg-[#695936] text-white py-2 px-4 rounded-lg hover:bg-[#7a6a42]">
            Pay with Card
          </button>
        </div>
      )}

      {activeTab === 'crypto' && (
        <div>
          {showQRCode ? (
            <div className="text-center">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Deposit Address</label>
                <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg border relative">
                  <span className="break-all mr-2">{cryptoWallet}</span>
                  <button
                    onClick={handleCopyToClipboard}
                    className="ml-2 px-3 py-1 bg-[#695936] text-white text-xs rounded hover:bg-[#7a6a42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#695936]"
                    title="Copy to clipboard"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-2 flex justify-center">
                  <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                    Network: USDT (ERC-20)
                  </span>
                </div>
              </div>
              
              <div className="mb-4 flex justify-center">
                <QRCodeSVG value={cryptoWallet} size={200} />
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                Send only USDT (ERC-20) to this address. Sending other assets may result in permanent loss.
              </p>
              
              {/* Transaction status section */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700">Transaction Status</h3>
                {transactionHash && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Deposit Transaction:</span>
                    <a 
                      href={`https://polygonscan.com/tx/${transactionHash}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#695936] hover:underline text-xs"
                    >
                      {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Amount Received:</span>
                  <span className="font-medium">{depositedAmount || '0.00'} USDT</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Deposit Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                    transactionStatus === 'Deposited' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transactionStatus === 'Waiting for deposit' && (
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {transactionStatus}
                  </span>
                </div>
                
                {/* Central wallet transfer status */}
                {transactionStatus === 'Deposited' && (
                  <>
                    <hr className="my-2 border-gray-200" />
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Transfer to Central Wallet</h4>
                    {centralTransferHash && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">Transfer Transaction:</span>
                        <a 
                          href={`https://polygonscan.com/tx/${centralTransferHash}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#695936] hover:underline text-xs"
                        >
                          {centralTransferHash.slice(0, 6)}...{centralTransferHash.slice(-4)}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Central Wallet:</span>
                      <span className="text-xs font-mono">0x14Bb...9B4C</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Transfer Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                        transferToCentralStatus === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transferToCentralStatus === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : transferToCentralStatus === 'Transferring'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transferToCentralStatus === 'Transferring' && (
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {transferToCentralStatus}
                      </span>
                    </div>
                  </>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {transactionStatus === 'Deposited' && transferToCentralStatus === 'Completed' 
                    ? 'Deposit received and successfully transferred to central wallet.'
                    : transactionStatus === 'Deposited' && transferToCentralStatus === 'Transferring'
                    ? 'Deposit received. Transferring to central wallet...'
                    : transactionStatus === 'Deposited' && transferToCentralStatus === 'Failed'
                    ? 'Deposit received but transfer to central wallet failed.'
                    : 'Deposits typically take 5-20 minutes to be detected after blockchain confirmation.'
                  }
                </p>
              </div>
              
              <button
                onClick={() => {
                  setShowQRCode(false);
                  // Reset all transaction states when generating new address
                  setTransactionHash('');
                  setDepositedAmount('');
                  setTransactionStatus('Waiting for deposit');
                  setTransferToCentralStatus('Pending');
                  setCentralTransferHash('');
                }}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Generate New Address
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                Click the button below to generate your personal deposit address for USDT (ERC-20).
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This address is uniquely tied to your account and will always remain the same.
              </p>
            </div>
          )}
        </div>
      )}

      {(!showQRCode || activeTab !== 'crypto') && (
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isGenerating}
          className={`w-full mt-6 bg-[#695936] text-white py-3 px-4 rounded-lg hover:bg-[#7a6a42] font-medium ${
            isGenerating ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isGenerating ? 'Generating Address...' : activeTab === 'crypto' ? 'Generate Wallet Address' : 'Deposit Funds'}
        </button>
      )}
    </div>
  );
};

export default DepositOptions;