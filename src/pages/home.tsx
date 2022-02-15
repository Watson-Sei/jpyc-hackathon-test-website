import React from 'react'
import ReactDOM from 'react-dom'
import { useWallet } from '../hooks/useWallet'

export const Home: React.VFC = () => {

    const { connectWallet, walletAddress } = useWallet();

    return (
        <div>
            <button onClick={() => connectWallet('metamask')}>
                Connect to MetaMask
            </button>
            {walletAddress}
        </div>
    )
}