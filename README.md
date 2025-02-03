# **DocChain**

DocChain is a blockchain-based system designed for **secure PII verification** and **document sharing**. It ensures privacy, transparency, and immutability while leveraging decentralized storage for document handling.

---

## **Features**

- **PII Verification:**
  - Validates government-issued IDs (e.g., Aadhaar) from an SQL database.
  - Ensures accurate and secure identity verification.

- **Document Sharing:**
  - Uploads and stores documents on IPFS (InterPlanetary File System).
  - Shares documents securely via blockchain with an immutable record.

---

## **Technologies Used**

- **Backend:** Node.js, Express.js, SQL
- **Decentralized Storage:** IPFS
- **Blockchain:** (Specify the platform, e.g., Ethereum, Hyperledger)
- **Frontend:** React.js (Optional, if applicable)

---

## **Getting Started**

### **Prerequisites**

- Node.js and npm
- SQL Database (e.g., MySQL, PostgreSQL)
- IPFS Node (local or cloud-based)
- Blockchain Network (e.g., Ganache for local testing)

### **Steps to Run**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/MandarNalhe/DocChain.git
   cd DocChain
   ```

2. **Backend Setup:**
   - Navigate to the backend folder:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Update `.env` file with SQL and blockchain node details.
   - Start the backend server:
     ```bash
     npm start
     ```

3. **IPFS Configuration:**
   - Ensure the IPFS node is running and accessible.

4. **Blockchain Configuration:**
   - Connect to the desired blockchain network (e.g., Ganache).

---

## **API Endpoints**

| Method | Endpoint                  | Description                      |
|--------|---------------------------|----------------------------------|
| POST   | `/api/pii/verify`         | Verifies PII against the database |
| POST   | `/api/documents/upload`  | Uploads document to IPFS         |
| GET    | `/api/documents/{id}`     | Retrieves document details       |
| POST   | `/api/blockchain/record` | Records transaction on blockchain |

---

## **Future Enhancements**

- Add user authentication for enhanced security.
- Integrate support for additional government IDs.
- Build a mobile app for document handling on the go.

---

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### **Contributions**

Contributions are welcome! Feel free to submit issues or pull requests to improve the project.
