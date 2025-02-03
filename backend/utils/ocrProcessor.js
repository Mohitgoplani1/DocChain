const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

const extractAadharNumber = async (imagePath) => {
  let worker;
  try {
    // Extensive file logging
    console.log('Image Path:', imagePath);
    
    // Detailed file information
    const fileStats = await fs.stat(imagePath);
    console.log('File Stats:', {
      size: fileStats.size,
      path: imagePath,
      ext: path.extname(imagePath)
    });

    // Read file contents for debugging
    const fileBuffer = await fs.readFile(imagePath);
    console.log('File Buffer Length:', fileBuffer.length);

    // Create worker with verbose logging
    worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        console.log('Tesseract Progress:', m);
      }
    });

    // Perform OCR with extensive logging
    const { data } = await worker.recognize(imagePath);
    
    console.log('Complete OCR Data:', {
      text: data.text,
      confidence: data.confidence,
      paragraphs: data.paragraphs,
      lines: data.lines,
      words: data.words
    });

    // Extract potential Aadhar numbers with more aggressive matching
    const potentialNumbers = extractPotentialNumbers(data.text);
    
    console.log('Potential Numbers Found:', potentialNumbers);

    // Try to find a valid Aadhar number
    for (const number of potentialNumbers) {
      if (isValidAadharNumber(number)) {
        return number;
      }
    }

    throw new Error('No valid Aadhar number found in image');
  } catch (error) {
    console.error('Comprehensive OCR Error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
};

// Enhanced number extraction
function extractPotentialNumbers(text) {
  console.log('Full OCR Text:', text);
  
  // Multiple regex patterns to catch different formats
  const patterns = [
    /\b\d{4}\s?\d{4}\s?\d{4}\b/g,  // Space-separated format
    /\b\d{12}\b/g,                 // Continuous 12 digits
    /\d{4}-\d{4}-\d{4}/g,          // Dash-separated format
  ];

  let matches = [];
  patterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) {
      matches.push(...found.map(m => m.replace(/\s|-/g, '')));
    }
  });

  // Additional extraction of number sequences
  const allNumbers = text.match(/\d+/g) || [];
  const twelveDigitNumbers = allNumbers.filter(num => num.length === 12);
  
  matches.push(...twelveDigitNumbers);

  // Remove duplicates and clean
  return [...new Set(matches)];
}

// Aadhar number validation
const isValidAadharNumber = (number) => {
  // Basic validation
  if (!/^\d{12}$/.test(number)) {
    console.log('Invalid number format:', number);
    return false;
  }

  // Optional: More sophisticated validation can be added here
  console.log('Potential valid Aadhar:', number);
  return true;
};

module.exports = {
  extractAadharNumber,
  isValidAadharNumber
};