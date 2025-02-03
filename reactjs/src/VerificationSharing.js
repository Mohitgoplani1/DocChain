import React, { useState, useEffect } from 'react';
import { Shield, Link, Upload, Share2, FileCheck, Loader2, Download, Eye } from 'lucide-react';
import axios from 'axios';
import Web3 from 'web3';
import ContractABI from './DocumentRegistry.json';

const styles = {
    pageBackground: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `
        radial-gradient(circle at 10% 10%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 90% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 90%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)
      `,
      zIndex: -1,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '32px',
      padding: '8px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
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
    tab: {
      padding: '14px 28px',
      fontSize: '1.1rem',
      backgroundColor: 'transparent',
      border: '2px solid transparent',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
    },
    activeTab: {
      backgroundColor: 'white',
      color: '#4f46e5',
      borderColor: '#e5e7eb',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    },
    card: {
      border: 'none',
      borderRadius: '16px',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
    },
    cardHeader: {
      padding: '24px',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)',
    },
    cardTitle: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      color: '#4338ca',
    },
    cardDescription: {
      color: '#6b7280',
      fontSize: '1.1rem',
      lineHeight: '1.6',
    },
    cardContent: {
      padding: '24px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.95rem',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      '&:focus': {
        borderColor: '#6366f1',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
      },
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      fontSize: '1.1rem',
      boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
    },
    buttonHover: {
      backgroundColor: '#4338ca',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 12px rgba(79, 70, 229, 0.3)',
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
      boxShadow: 'none',
      transform: 'none',
    },
    downloadButton: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      fontSize: '0.95rem',
      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
    },
    downloadButtonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
    },
    alert: {
      marginTop: '24px',
      padding: '20px',
      borderRadius: '12px',
      backgroundColor: 'rgba(209, 250, 229, 0.9)',
      border: '2px solid #34d399',
      backdropFilter: 'blur(8px)',
    },
    alertTitle: {
      fontWeight: 'bold',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      color: '#047857',
      fontSize: '1.2rem',
    },
    documentList: {
      marginTop: '24px',
    },
    documentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      borderBottom: '2px solid #e5e7eb',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(243, 244, 246, 0.5)',
      },
    },
    spinAnimation: {
      animation: 'spin 1s linear infinite',
    },
  };
  

export default function DocChain() {
  const [activeTab, setActiveTab] = useState('verify');
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sharing, setSharing] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [retrieving, setRetrieving] = useState(false);
  const [viewing, setViewing] = useState(false);

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

  const handleFileChange = (e) => setFile(e.target.files[0]);

const handleViewDocument = async () => {
  if (!ipfsHash) {
    alert('No document hash available to view.');
    return;
  }

  setViewing(true);

  try {
    const url = `https://ipfs.io/ipfs/${ipfsHash}`;
    const response = await axios.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const viewUrl = window.URL.createObjectURL(blob);
    window.open(viewUrl, '_blank');
    window.URL.revokeObjectURL(viewUrl);
  } catch (error) {
    console.error('Document View Error:', error);
    alert('Failed to view document. Check console for details.');
  } finally {
    setViewing(false);
  }
};

  const handleAadharVerification = async () => {
    if (!file || !walletAddress) {
      alert('Please upload a file and connect your wallet.');
      return;
    }

    const formData = new FormData();
    formData.append('aadharImage', file);
    formData.append('walletAddress', walletAddress);

    setUploading(true);
    setVerificationResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/verify-aadhar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVerificationResult(response.data);
      setIpfsHash(response.data.ipfsHash);
    } catch (error) {
      console.error('Verification Error:', error);
      alert('Verification failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  const handleShareDocument = async () => {
    if (!ipfsHash || !recipientAddress || !walletAddress) {
      alert('Please enter the IPFS hash, recipient address, and your wallet address.');
      return;
    }

    if (!web3 || !contract) {
      alert('Web3 or contract is not initialized. Please refresh the page.');
      return;
    }

    setSharing(true);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const senderAddress = accounts[0];

      const gasEstimate = await contract.methods
        .shareDocument(ipfsHash, recipientAddress)
        .estimateGas({ from: senderAddress });
      const gasPrice = await web3.eth.getGasPrice();

      await contract.methods.shareDocument(ipfsHash, recipientAddress).send({
        from: senderAddress,
        gas: gasEstimate,
        gasPrice: gasPrice,
      });

      alert('Document shared successfully!');
    } catch (error) {
      console.error('Sharing Error:', error);
      alert('Document sharing failed. Check console for details.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <div style={styles.pageBackground} />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Document Verification and Sharing</h1>
          <button style={styles.connectButton} onClick={connectWallet}>
            {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
          </button>
        </div>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'verify' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('verify')}
          >
            <Shield size={20} />
            Aadhaar Verification
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'share' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('share')}
          >
            <Share2 size={20} />
            Document Sharing
          </button>
        </div>

        {activeTab === 'verify' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                <Shield style={{ marginRight: '8px' }} /> Aadhaar Verification
              </h2>
              <p style={styles.cardDescription}>
                Securely verify your Aadhaar Document
              </p>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="walletAddress">
                  Wallet Address
                </label>
                <input
                  id="walletAddress"
                  style={styles.input}
                  placeholder="Enter your Ethereum wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="aadharFile">
                  Aadhaar Document
                </label>
                <input
                  id="aadharFile"
                  style={styles.input}
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={{
                    ...styles.button,
                    ...(uploading ? styles.buttonDisabled : {}),
                  }}
                  onClick={handleAadharVerification}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                      Verifying
                    </>
                  ) : (
                    <>
                      <Upload style={{ marginRight: '8px' }} />
                      Verify Aadhaar
                    </>
                  )}
                </button>
                
                {verificationResult && (
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: '#10b981',
                      ...(viewing ? styles.buttonDisabled : {}),
                    }}
                    onClick={handleViewDocument}
                    disabled={viewing}
                  >
                    {viewing ? (
                      <>
                        <Loader2 style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                        Loading
                      </>
                    ) : (
                      <>
                        <Eye style={{ marginRight: '8px' }} />
                        View Document
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                <Link style={{ marginRight: '8px' }} /> Share Document
              </h2>
              <p style={styles.cardDescription}>
                Share your Verified Document securely over Blockchain.
              </p>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="ipfsHash">
                  IPFS Hash
                </label>
                <input
                  id="ipfsHash"
                  style={styles.input}
                  placeholder="Enter the IPFS hash of your verified document"
                  value={ipfsHash}
                  onChange={(e) => setIpfsHash(e.target.value)}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="recipientAddress">
                  Recipient Wallet Address
                </label>
                <input
                  id="recipientAddress"
                  style={styles.input}
                  placeholder="Enter the recipient's Ethereum wallet address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <button
                style={{
                  ...styles.button,
                  ...(sharing ? styles.buttonDisabled : {}),
                }}
                onClick={handleShareDocument}
                disabled={sharing}
              >
                {sharing ? (
                  <>
                    <Loader2 style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                    Sharing
                  </>
                ) : (
                  <>
                    <Share2 style={{ marginRight: '8px' }} />
                    Share Document
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {verificationResult && (
          <div style={styles.alert}>
            <h3 style={styles.alertTitle}>
              <FileCheck style={{ marginRight: '8px' }} />
              Verification Successful
            </h3>
            <p>
              <strong>Aadhaar Number:</strong> {verificationResult.data.aadharNumber}
            </p>
            <p>
              <strong>IPFS Hash:</strong> {verificationResult.ipfsHash}
            </p>
          </div>
        )}
      </div>
    </>
  );
}