import { ethers } from "ethers";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { walletAddressState, walletProviderState } from "../stores/atoms";

interface Window {
    ethereum: any;
}

declare const window: Window;

interface Installed {
    isInstalled: boolean;
    returnProvider: any;
}

export const useWallet = () => {
    const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
    const [walletProvider, setWalletProvider] = useRecoilState(walletProviderState);

    // Is MetaMask installed?
    const isMetaMaskInstalled = (): Installed => {
        const {ethereum} = window;
        if (!Boolean(ethereum)) {
            return { isInstalled: false, returnProvider: null };
        }
        if (!ethereum.isMetaMask) {
            return { isInstalled: false, returnProvider: null };
        }
        if (ethereum.isMetaMask && !ethereum.providers) {
            return { isInstalled: true, returnProvider: ethereum };
        }
        if (ethereum.isMetaMask && ethereum.providers) {
            const provider = ethereum.providers.find((provider: { isMetaMask: any; }) => provider.isMetaMask);
            return { isInstalled: true, returnProvider: provider };
        }
        return { isInstalled: false, returnProvider: null };
    }

    // Wallet connection process
    const connectWallet = async (detect: string) => {
        let provider: any;
        if (detect === "metamask") {
            const { isInstalled, returnProvider } = isMetaMaskInstalled();
            if (!isInstalled) {
                console.log('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!');
                return;
            }
            provider = returnProvider;
        }
        try {
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            setWalletAddress(accounts[0]);
            setWalletProvider('metamask')
        } catch (error: any) {
            if (error.code === 4001) {
                console.log('User rejected request');
            }
            console.error(error);
        }
    }

    if (typeof window !== 'undefined') {
        useEffect(() => {
            let provider: any;
            if (walletProvider === "metamask") {
                const {isInstalled, returnProvider} = isMetaMaskInstalled();
                if (!isInstalled) {
                    console.log('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!');
                    return;
                }
                provider = returnProvider;
            }
            if (provider && provider.on) {
                if (provider.request({ method: 'eth_requestAccounts'})[0]) {
                    setWalletAddress(provider.request({ method: 'eth_requestAccounts' }));
                }

                const handleAccountsChanged = async (accounts: string[]) => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                }

                provider.on('accountsChanged', handleAccountsChanged);
            }
        }, [walletAddress]);
    }

    return {
        connectWallet,
        walletAddress,
    }
}