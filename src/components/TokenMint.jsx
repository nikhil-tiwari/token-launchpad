import { useState, useEffect } from 'react';
import { useLocation, Navigate } from "react-router-dom";
import { PublicKey, Connection } from '@solana/web3.js';

const TokenMint = () => {
    const location = useLocation();
    const mintKeypair = location.state?.mint;
    
    const [mintAddress, setMintAddress] = useState(null);
    const [supply, setSupply] = useState(null);
    const [decimals, setDecimals] = useState(null);
    const [mintAuthority, setMintAuthority] = useState(null);
    const [name, setName] = useState(null);
    const [symbol, setSymbol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log("Mint keypair: " + mintKeypair)

    useEffect(() => {
        const connection = new Connection('https://api.devnet.solana.com');
        if (!mintKeypair) return;

        const fetchMintInfo = async () => {
            try {
                const mintPublicKey = new PublicKey(mintKeypair._keypair.publicKey);
                console.log("Mint public key: " + mintPublicKey)
                const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);
                
                if (!accountInfo || !accountInfo.value) {
                    setError('Account info not found');
                    return;
                }

                console.log("Account Info:", accountInfo.value);
                
                const mintData = accountInfo.value.data.parsed.info;

                setMintAddress(mintPublicKey.toBase58());
                setSupply(mintData.supply);
                setDecimals(mintData.decimals);
                setName(mintData.extensions[1].state.name);
                setSymbol(mintData.extensions[1].state.symbol);
                setMintAuthority(mintData.mintAuthority);

            } catch (error) {
                console.error('Error fetching mint info:', error);
                setError('Error fetching mint info');
            } finally {
                setLoading(false);
            }
        };

        fetchMintInfo();
    }, [mintKeypair]);

    if (!mintKeypair) {
        return <Navigate to="/" />;
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="mt-20 h-full flex flex-col justify-center items-center">
            <h1 className="text-5xl font-semibold">Token Mint</h1>
            {mintAddress && <p className="mt-8 text-xl"><span className="font-semibold">Token Mint Address:</span> {mintAddress}</p>}
            {mintAuthority && <p className="mt-4 text-xl"><span className="font-semibold">Mint Authority:</span> {mintAuthority}</p>}
            {name && <p className="mt-4 text-xl"><span className="font-semibold">Name:</span> {name}</p>}
            {symbol && <p className="mt-4 text-xl"><span className="font-semibold">Symbol:</span> {symbol}</p>}
            {supply !== null && <p className="mt-4 text-xl"><span className="font-semibold">Total Supply:</span> {supply}</p>}
            {decimals !== null && <p className="mt-4 text-xl"><span className="font-semibold">Decimals:</span> {decimals}</p>}
            
        </div>
    );
};

export default TokenMint;
