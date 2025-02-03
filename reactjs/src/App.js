import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import Web3 from 'web3';
import ContractABI from './DocumentRegistry.json';
import VerificationSharing from './VerificationSharing';
import RetrieveDocuments from './RetrieveDocument';
import { Shield, Download } from 'lucide-react';
import { styles } from './styles/styles';
import { useAnimations } from './hooks/useAnimations';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const contractAddress = '0x696462745a549906AD3F979926cC086e1775583A';

  // Initialize animations
  useAnimations();

  useEffect(() => {
    const initWeb3AndContract = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const contractInstance = new web3Instance.eth.Contract(ContractABI, contractAddress);

          setWeb3(web3Instance);
          setContract(contractInstance);

          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);

          window.ethereum.on('accountsChanged', (accounts) => {
            setWalletAddress(accounts[0]);
          });
        } catch (error) {
          console.error('Error initializing Web3 or contract:', error);
        }
      } else {
        alert('MetaMask is not detected. Please install it to use this application.');
      }
    };

    initWeb3AndContract();
  }, []);

  return (
    <Router>
      <div style={styles.container}>
        <div style={styles.backgroundAnimation} />
        <header style={styles.header}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>DocChain</h1>
            <p style={styles.subtitle}>Securely verify and share your documents</p>
          </div>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navButton}>
              <Shield style={{ marginRight: '8px' }} />
              Verify & Share
            </Link>
            <Link to="/retrieve" style={styles.navButton}>
              <Download style={{ marginRight: '8px' }} />
              Retrieve Documents
            </Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<VerificationSharing />} />
          <Route path="/retrieve" element={<RetrieveDocuments />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;