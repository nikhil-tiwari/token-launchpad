import { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useNavigate } from "react-router-dom";

export function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [availableTokens, setAvailableTokens] = useState([]);
  const { connection } = useConnection();
  const wallet = useWallet();
  const navigate = useNavigate();

  const handleCreateToken = async () => {
    setError("");
    try {
      console.log("Creating token...");
      const mintKeypair = Keypair.generate();
      console.log("Mint keypair: " + mintKeypair)
      const metadata = {
        mint: mintKeypair.publicKey,
        name: name,
        symbol: symbol,
        uri: image,
        additionalMetadata: [],
      };
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          9,
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      )?.blockhash;
      transaction.partialSign(mintKeypair);

      const signature = await wallet.sendTransaction(transaction, connection);
      console.log("Signature: " + signature);
      console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);

      setAvailableTokens([
        ...availableTokens,
        {
          name: name,
          symbol: symbol,
          uri: image,
          mint: mintKeypair,
        },
      ]);

      setName("");
      setSymbol("");
      setImage("");
      // navigate("/token", { state: { mint: mintKeypair } });
    } catch (err) {
      console.error("Error creating token:", err);
      setError("Failed to create token. Please try again.");
    }
  };

  const handleNavigate = (token) => {
    navigate("/token", { state: { mint: token.mint } })
  }

  return (
    <>
      <div className="mt-20 h-full flex flex-col justify-center items-center">
        <h1 className="text-5xl font-semibold">Solana Token Launchpad</h1>
        <input
          className="mt-8 py-3 px-4 w-[300px] bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="mt-8 py-3 px-4 w-[300px] bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <input
          className="mt-8 py-3 px-4 w-[300px] bg-neutral-700 rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white font-semibold py-3 px-6 mt-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleCreateToken}
          disabled={!name || !image || !symbol}
        >
          Create a token
        </button>
        {error && <div className="mt-4 text-red-500">{error}</div>}
      </div>
      {availableTokens.length > 0 && (
        <div className="p-4 mt-6">
          <h2 className="text-3xl text-neutral-200">Available Token Mint</h2>
          <div className="flex flex-wrap items-center justify-around mt-10">
            {availableTokens.map((token, index) => (
              <div key={index+1} onClick={() => handleNavigate(token)} className="flex flex-col justify-between min-w-48 w-56 h-56 bg-violet-900 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="flex justify-center items-center h-[60%]">
                  <img
                    className="w-20 h-20 rounded-[50%]"
                    src={token.uri}
                    alt="logo"
                  />
                </div>
                <div className="flex flex-col justify-end gap-1 items-start h-[40%] px-2 pb-2">
                  <p className="text-xl">{token.name}</p>
                  <p>{token.symbol}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
