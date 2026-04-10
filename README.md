# AIRA - Autonomous AI-Powered Research Assistant

AIRA is a full-stack, black-themed intelligence dashboard and autonomous agent that streamlines personal and academic research. By utilizing Pinecone for Vector Storage and Google Gemini for dynamic language modeling, AIRA enables users to ingest documents, generate automated insights, view live interactive knowledge graphs, and chat directly with their uploaded literature.

---

## ⚡ Features

- **Document Ingestion:** Upload PDFs or provide remote URLs to automatically index data.
- **RAG Architecture:** Leverages Pinecone Vector Database to accurately query your local knowledge base.
- **Autonomous Agents:** Powered by Gemini AI to run summaries, extract entity relationships, and provide detailed chat answers.
- **Interactive Knowledge Graph:** A modern, D3.js-powered visual mapping of concepts and authors based on document semantics.
- **Modern UI/UX:** Built with React, Tailwind CSS v4, and Lucide Icons offering a premium glassmorphic dark theme.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- D3.js (Data Visualization)
- Axios & Lucide React

**Backend:**
- Node.js & Express
- MongoDB (Mongoose)
- Pinecone (Vector Database)
- Google Gen AI SDK (Gemini Models)
- pdf-parse & cheerio (Ingestion Pipeline)

---

## 🚀 Local Development Setup

To run this application locally, you will need Node.js and API keys for MongoDB, Pinecone, and Google Gemini.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aira-research-assistant.git
cd aira-research-assistant
```

### 2. Backend Setup
Navigate to the backend folder and install the dependencies:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_cluster_uri
GEMINI_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend folder, and install the dependencies:
```bash
cd frontend
npm install
```

*(Optional)* Map your local backend by placing an `.env` file in the frontend folder (though it defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🌐 Deployment Guide (Production)

The repository is pre-configured for modern, seamless deployments across distinct hosting providers for the Server and the Client.

### Backend Deployment (Render, Heroku, etc.)
1. Create a new Web Service on your hosting provider.
2. Select this GitHub repository and set the **Root Directory** to `backend`.
3. The platform will automatically use the standard `npm install` and `npm start` commands.
4. **Crucial:** Add all of your `.env` variables (MongoDB URI, API Keys) into your host's production Environment Variables settings.
5. Capture the deployed URL (e.g., `https://aira-api.onrender.com`).

### Frontend Deployment (Vercel, Netlify, etc.)
1. Create a new Web Project on your hosting provider.
2. Select this GitHub repository and set the **Root Directory** to `frontend`.
3. In the environment variables configuration, add a new variable:
   - `VITE_API_URL` = `https://aira-api.onrender.com` *(Replace this with your deployed backend URL from the previous step).*
4. Deploy the application. The system will run `npm run build` by default.

---

*Designed and engineered by Timothy Abejoye.*
