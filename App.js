import React, { useEffect, useState } from "react";
import "./App.css";

const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const MODULE_ADDRESS = "prasad_addr"; // Replace with your deployed account address
const RESOURCE_TYPE = `${MODULE_ADDRESS}::Voting::PollHolder`;
const VOTING_FUNCTION = `${MODULE_ADDRESS}::Voting::vote`;

const OPTIONS = ["DeFi", "NFTs", "Gaming"];

function App() {
  const [wallet, setWallet] = useState(null);
  const [results, setResults] = useState([]);
  const [voted, setVoted] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.aptos) {
        throw new Error("Aptos wallet not detected");
      }
      await window.aptos.connect();
      const account = await window.aptos.account();
      setWallet(account.address);
    } catch (err) {
      alert("Wallet connection failed: " + err.message);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
      }
      setWallet(null);
      setResults([]);
      setVoted(false);
    } catch (err) {
      alert("Error disconnecting wallet: " + err.message);
    }
  };

  const castVote = async (choice) => {
    if (!wallet) {
      alert("Please connect your wallet first");
      return;
    }

    const payload = {
      type: "entry_function_payload",
      function: VOTING_FUNCTION,
      arguments: [MODULE_ADDRESS, choice],
      type_arguments: [],
    };

    try {
      const tx = await window.aptos.signAndSubmitTransaction(payload);
      alert("Vote submitted! Tx: " + tx.hash);
      setVoted(true);
      await fetchResults();
    } catch (err) {
      alert("Error voting: " + err.message);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(
        `${NODE_URL}/accounts/${MODULE_ADDRESS}/resource/${RESOURCE_TYPE}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      const counts = data.data.poll.counts; // Accessing poll inside PollHolder
      setResults(counts);
    } catch (err) {
      console.error("Failed to fetch results", err);
      setResults([]);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchResults();
    }
  }, [wallet]);

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🚀 Aptos Blockchain Voting DApp</h1>

        {!wallet ? (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="wallet-info">
              <p>
                <b>Wallet:</b> {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
              </p>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>

            <h2 className="subtitle">Vote for your favorite Web3 use case:</h2>
            <div className="options">
              {OPTIONS.map((option, idx) => (
                <button
                  key={idx}
                  className="vote-btn"
                  onClick={() => castVote(idx)}
                  disabled={voted}
                >
                  {option}
                </button>
              ))}
            </div>

            <h3 className="results-title">📊 Live Results:</h3>
            <div className="results">
              {results.length > 0 ? (
                OPTIONS.map((option, idx) => (
                  <div key={idx} className="result-item">
                    <span>{option}</span>
                    <span>{results[idx] || 0} vote(s)</span>
                  </div>
                ))
              ) : (
                <p>No votes yet or loading...</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;