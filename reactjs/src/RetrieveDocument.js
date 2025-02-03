import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, Loader2, FileText, ExternalLink } from "lucide-react";
import Web3 from 'web3';
import ContractABI from './DocumentRegistry.json';

const styles = {
  container: {
    position: "relative",
    zIndex: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(229, 231, 235, 0.3)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease-in-out",
    marginBottom: "2rem",
  },
  cardHeader: {
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)",
    borderBottom: "1px solid rgba(229, 231, 235, 0.3)",
  },
  cardTitle: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  cardDescription: {
    color: "#666",
    fontSize: "1.1rem",
    lineHeight: "1.5",
  },
  cardContent: {
    padding: "24px",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    "&:focus": {
      borderColor: "#6366f1",
      outline: "none",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    },
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(99, 102, 241, 0.2)",
    "&:hover": {
      backgroundColor: "#4f46e5",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 8px rgba(99, 102, 241, 0.3)",
    },
  },
  buttonDisabled: {
    backgroundColor: "#a5a6f6",
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
  documentList: {
    marginTop: "32px",
  },
  documentListTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  documentItem: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    },
  },
  documentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  documentIcon: {
    color: "#6366f1",
  },
  documentHash: {
    fontSize: "0.9rem",
    color: "#4b5563",
    fontFamily: "monospace",
  },
  downloadButton: {
    padding: "8px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: "32px",
    color: "#6b7280",
  },
  spinAnimation: {
    animation: "spin 1s linear infinite",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  connectButton: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
};

export default function RetrieveDocument() {
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [retrieving, setRetrieving] = useState(false);
  const [loading, setLoading] = useState(false);
  const contractAddress = '0x696462745a549906AD3F979926cC086e1775583A';

  useEffect(() => {
    const initWeb3AndContract = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const contractInstance = new web3Instance.eth.Contract(ContractABI, contractAddress);
          setWeb3(web3Instance);
          setContract(contractInstance);
        } catch (error) {
          console.error('Error initializing Web3 or contract:', error);
        }
      } else {
        alert('MetaMask is not detected. Please install it to use this application.');
      }
    };
    initWeb3AndContract();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not detected. Please install it to use this application.');
    }
  };

  const handleFetchSharedDocuments = async () => {
    if (!walletAddress) {
      alert("Please enter your wallet address.");
      return;
    }

    if (!web3) {
      alert("Web3 is not initialized. Please refresh the page.");
      return;
    }

    setRetrieving(true);

    try {
      const sharedDocs = await contract.methods
        .getUserDocuments(walletAddress)
        .call();
      const docsWithSenders = await Promise.all(
        sharedDocs.map(async (hash) => {
          const sender = await contract.methods
            .documentSenders(walletAddress, hash)
            .call();
          return { hash, sender };
        })
      );
      setSharedDocuments(docsWithSenders);
    } catch (error) {
      console.error("Retrieval Error:", error);
      alert("Failed to retrieve shared documents. Check console for details.");
    } finally {
      setRetrieving(false);
    }
  };

  const handleRetrieveDocument = async (hash) => {
    setLoading(true);
    try {
      const url = `https://ipfs.io/ipfs/${hash}`;
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `document-${hash.slice(0, 8)}.jpeg`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("IPFS Retrieval Error:", error);
      alert("Failed to retrieve the document. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Retrieve Document</h1>
        <button style={styles.connectButton} onClick={connectWallet}>
          {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
        </button>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            <Download style={{ marginRight: "12px" }} /> Retrieve Your Documents
          </h2>
          <p style={styles.cardDescription}>
            Access and download documents that have been shared with your wallet
            address through the blockchain.
          </p>
        </div>
        <div style={styles.cardContent}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="walletAddress">
              Your Ethereum Wallet Address
            </label>
            <input
              id="walletAddress"
              style={styles.input}
              placeholder="Enter your Ethereum wallet address (0x...)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>

          <button
            style={{
              ...styles.button,
              ...(retrieving && styles.buttonDisabled),
            }}
            onClick={handleFetchSharedDocuments}
            disabled={retrieving}
          >
            {retrieving ? (
              <>
                <Loader2
                  style={{ ...styles.spinAnimation, marginRight: "8px" }}
                />
                Fetching Documents...
              </>
            ) : (
              <>
                <Download style={{ marginRight: "8px" }} />
                Fetch My Documents
              </>
            )}
          </button>

          {sharedDocuments.length > 0 ? (
            <div style={styles.documentList}>
              <h3 style={styles.documentListTitle}>
                <FileText size={20} />
                Available Documents
              </h3>
              {sharedDocuments.map((doc, index) => (
                <div key={index} style={styles.documentItem}>
                  <div>
                    <p>
                      <strong>IPFS Hash:</strong> {doc.hash}
                    </p>
                    <p>
                      <strong>Sender:</strong> {doc.sender}
                    </p>
                  </div>
                  <button
                    style={styles.downloadButton}
                    onClick={() => handleRetrieveDocument(doc.hash)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 style={styles.spinAnimation} size={16} />
                    ) : (
                      <>
                        <Download size={16} />
                        Download
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !retrieving && (
              <div style={styles.emptyState}>
                <p>
                  No documents found. Documents shared with your address will
                  appear here.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
