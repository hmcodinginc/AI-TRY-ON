# 👕 AI Fashion Try-On & E-Commerce Platform

Welcome to the AI Fashion Try-On platform repository! This project demonstrates a modern E-Commerce architecture augmented by an advanced Virtual Try-On (VTO) widget/add-on.

## 🏗️ Project Architecture

This repository contains two main subsystems designed to interact with each other seamlessly (B2B2C Add-on model):

1. **`ecommerce/`**: The core E-commerce Website. 
   - **Client**: React frontend (`localhost:5173`)
   - **Server**: Node.js/Express backend (`localhost:5000`)
   - *Purpose*: Acts as the host merchant's standard shopping experience.

2. **`ai-tryon/`**: The Virtual Try-On Add-on / Widget.
   - **Client**: React frontend (`localhost:5174`)
   - **Server**: Node.js/Express backend (`localhost:6001`)
   - *Purpose*: The standalone service providing the AI capabilities, outfit studio, and API infrastructure that integrates with the host e-commerce store.

3. **`storage/`**: Centralized local file storage for product images and generated user try-on outputs.

## 🔐 Security & Environments (Important for Team)

**Never commit `.env` files.** They are ignored by Git for security purposes (to prevent API key leaks). 

To set up your local environment:
1. Navigate to both `ecommerce/server` and `ai-tryon/server`.
2. Find the `.env.example` files in each directory.
3. Duplicate them and rename the duplicates to `.env`.
4. Fill in the required secrets (e.g., MongoDB URI, HuggingFace Tokens, etc.) in your local `.env` files.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Start the E-Commerce Platform
\`\`\`bash
cd ecommerce/server
npm install
npm run dev  # Runs the backend on port 5000

# Open a new terminal:
cd ecommerce/client
npm install
npm run dev  # Runs the frontend on port 5173
\`\`\`

### 2. Start the AI Try-On Platform
\`\`\`bash
cd ai-tryon/server
npm install
npm run dev  # Runs the backend on port 6001

# Open a new terminal:
cd ai-tryon/client
npm install
npm run dev  # Runs the frontend on port 5174
\`\`\`

## 🧠 Current AI Try-On Logic (For Dev Team)
- **Demo Mode**: The current AI Try-On matching engine is strictly filtered to showcase Men's and Unisex outfits. The `demoValidator.js` intentionally blocks women's clothing from entering the Cartesian pairing engine (Outfit Studio). The `ecommerce` site displays all products normally.
- **Background Eraser**: Ensures user uploaded images are clipped perfectly for accurate API requests.
- **Provider API**: Currently supports zero-GPU spaces and dedicated HuggingFace APIs for inference.

