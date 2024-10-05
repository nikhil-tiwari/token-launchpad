import "./App.css";
import { TokenLaunchpad } from "./components/TokenLaunchpad";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Routes, Route } from "react-router-dom";
import TokenMint from "./components/TokenMint";

function App() {
  return (
    <div>
      <div className="fixed top-0 -z-10 h-full w-full" >
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>
      <div>
        <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
          <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <div className="flex justify-between p-5">
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
              <Routes>
                <Route path="/" element={<TokenLaunchpad />}/>
                <Route path="/token" element={<TokenMint />}/>
              </Routes>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </div>
  );
}

export default App;
