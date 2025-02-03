require('dotenv').config(); // Load environment variables

const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const { extractAadharNumber, isValidAadharNumber } = require('./utils/ocrProcessor');
const fs = require('fs');
const fsp = fs.promises;
const pinataSDK = require('@pinata/sdk');
const { Web3 } = require('web3');
const mysql = require('mysql2');

// Initialize services  
const app = express();
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});
const web3 = new Web3(process.env.WEB3_PROVIDER || 'http://localhost:8545');
const contractABI = require('./DocumentRegistry.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const privateKey = process.env.PRIVATE_KEY;

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nilay@c5',
  database: process.env.DB_NAME || 'docchain',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const promisePool = pool.promise();

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, 'aadhar-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and PDFs Only!');
    }
  },
});

// Ensure private key is added
if (privateKey) {
  const account = web3.eth.accounts.wallet.add(privateKey);
  console.log('Using account:', account.address);
} else {
  console.error('Private key is missing in the environment variables.');
  return res.status(500).json({ error: 'Server misconfiguration: Missing private key' });
}


// Routes

// Upload and verify Aadhar
app.post('/api/verify-aadhar', upload.single('aadharImage'), async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !web3.utils.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Valid wallet address is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const imagePath = path.join(__dirname, req.file.path);

    let aadharNumber;
    try {
      aadharNumber = await extractAadharNumber(imagePath);
    } catch (ocrError) {
      console.error('OCR Error:', ocrError);
      await fsp.unlink(imagePath).catch((err) => console.error('File cleanup error:', err));
      return res.status(422).json({ error: 'Could not extract valid Aadhar number from image.' });
    }

    if (!isValidAadharNumber(aadharNumber)) {
      await fsp.unlink(imagePath).catch((err) => console.error('File cleanup error:', err));
      return res.status(422).json({ error: 'Invalid Aadhar number format.' });
    }

    const [rows] = await promisePool.execute('SELECT * FROM aadhaar WHERE Aadhar_No = ?', [aadharNumber]);

    if (rows.length === 0) {
      await fsp.unlink(imagePath).catch((err) => console.error('File cleanup error:', err));
      return res.status(404).json({ error: 'Aadhar not found in database.' });
    }

    const fileStream = fs.createReadStream(imagePath);

    const pinataOptions = {
      pinataMetadata: { name: req.file.filename },
      pinataOptions: { cidVersion: 0 },
    };

    try {
      const pinataResult = await pinata.pinFileToIPFS(fileStream, pinataOptions);
      const ipfsHash = pinataResult.IpfsHash;

      console.log('File uploaded to IPFS with hash:', ipfsHash);

      const gasEstimate = await contract.methods.registerDocument(ipfsHash).estimateGas({ from: walletAddress });

      await contract.methods.registerDocument(ipfsHash).send({
        from: walletAddress,
        gas: gasEstimate,
        gasPrice: await web3.eth.getGasPrice(),
      });

      await fsp.unlink(imagePath).catch((err) => console.error('File cleanup error:', err));

      res.json({
        success: true,
        verified: true,
        ipfsHash,
        data: {
          aadharNumber,
          name: rows[0].name,
          dob: rows[0].dob,
        },
      });
    } catch (error) {
      console.error('Error while uploading file to IPFS or contract execution:', error);
      await fsp.unlink(imagePath).catch((err) => console.error('File cleanup error:', err));
      res.status(500).json({ error: 'Error uploading file or registering document.' });
    }
  } catch (error) {
    console.error('Error in /api/verify-aadhar:', error);
    if (req.file) {
      await fsp.unlink(path.join(__dirname, req.file.path)).catch((err) => console.error('File cleanup error:', err));
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});
// Share document
app.post('/api/share-document', async (req, res) => {
  try {
    const { ipfsHash, recipientAddress, senderAddress } = req.body;

    // Ensure all fields are provided
    if (!ipfsHash || !recipientAddress || !senderAddress) {
      return res.status(400).json({ error: 'IPFS hash, sender address, and recipient address are required.' });
    }

    // Validate the Ethereum addresses (both recipient and sender)
    if (!web3.utils.isAddress(recipientAddress) || !web3.utils.isAddress(senderAddress)) {
      return res.status(400).json({ error: 'Invalid sender or recipient address.' });
    }

    // Gas estimation with proper error handling
    let gasEstimate;
    try {
      gasEstimate = await contract.methods.shareDocument(ipfsHash, recipientAddress).estimateGas({ from: senderAddress });
    } catch (err) {
      console.error("Gas estimation failed:", err);
      return res.status(500).json({ error: 'Gas estimation failed. Please try again.' });
    }

    // Send the transaction with the estimated gas
    try {
      await contract.methods.shareDocument(ipfsHash, recipientAddress).send({
        from: senderAddress,
        gas: gasEstimate,
        gasPrice: await web3.eth.getGasPrice(),  // Dynamically get gas price
      });

      res.json({ success: true, message: 'Document shared successfully.' });
    } catch (sendError) {
      console.error("Transaction failed:", sendError);
      res.status(500).json({ error: 'Document sharing failed. Transaction failed on the blockchain.' });
    }
  } catch (error) {
    console.error('Error in /api/share-document:', error);
    res.status(500).json({ error: 'Document sharing failed due to an unexpected error.' });
  }
});

const retrieveDocumentFromIPFS = async (ipfsHash) => {
  try {
      const url = `https://ipfs.io/ipfs/${ipfsHash}`;
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error('Failed to retrieve document from IPFS');
      }
      const documentBlob = await response.blob();

      // Create a downloadable link for the document
      const downloadUrl = window.URL.createObjectURL(documentBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'document.jpeg'; // Change extension based on the uploaded file type
      link.click();
  } catch (error) {
      console.error('Error retrieving document:', error);
      alert('Failed to retrieve document from IPFS. Check console for details.');
  }
};


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
