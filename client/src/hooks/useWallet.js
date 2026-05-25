import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.ethereum) return;

    const p = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(p);

    const handleAccounts = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
      } else {
        setAddress(ethers.utils.getAddress(accounts[0]));
        setSigner(p.getSigner());
      }
    };

    const handleChain = (chain) => setChainId(Number(chain));

    window.ethereum.request({ method: 'eth_accounts' }).then(handleAccounts).catch(() => {});
    window.ethereum.on('accountsChanged', handleAccounts);
    window.ethereum.on('chainChanged', handleChain);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccounts);
        window.ethereum.removeListener('chainChanged', handleChain);
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) throw new Error('No Ethereum provider');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const p = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(p);
    setSigner(p.getSigner());
    setAddress(ethers.utils.getAddress(accounts[0]));
    const net = await p.getNetwork();
    setChainId(net.chainId);
    return accounts[0];
  }, []);

  return { provider, signer, address, chainId, connect };
}
