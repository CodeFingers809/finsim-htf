# FinSim - AI-Powered Trading Strategy Platform 🚀

A full-stack financial simulation platform for backtesting trading strategies, optimizing portfolios, and analyzing stock performance using AI-powered insights.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## ✨ Features

### 📈 AI-Powered Backtesting
- **Natural Language Strategy Input**: Describe your trading strategy in plain English
- **LLM-Generated Code**: Gemini AI converts your strategy to executable Python code
- **Multi-Asset Testing**: Backtest across multiple stocks simultaneously
- **Pre-built Market Baskets**: NIFTY 50, SENSEX 30, IT Sector, Banking, Pharma, Auto sectors
- **Comprehensive Metrics**: Sharpe ratio, max drawdown, win rate, profit factor
- **AI Analysis**: Automated verification and improvement recommendations

### 💼 Portfolio Optimization
- **Multiple Strategies**: Min Risk, Max Sharpe, HRP (Hierarchical Risk Parity), Kelly Criterion
- **Advanced Metrics**: VaR, CVaR, diversification ratio, effective assets
- **Risk Analysis**: Correlation insights, concentration warnings
- **Capital Allocation**: Optimal weight distribution across assets

### 📊 Stock Research & Analysis
- **Real-time Data**: Live stock prices via Yahoo Finance
- **Financial Statements**: Balance sheets, cash flow, income statements
- **Interactive Charts**: TradingView-style candlestick charts
- **Watchlist Management**: MongoDB-backed persistent watchlists
- **Stock Search**: Search across NSE/BSE listed stocks

### 🤖 Agentic RAG Research
- **AI Research Assistant**: Query financial documents and market data
- **Vector Search**: Semantic search across financial knowledge base
- **Contextual Insights**: AI-powered analysis with source citations

## 🏗️ Architecture

```
├── backend/                 # Python Flask API
│   ├── app/
│   │   ├── routes/
│   │   │   ├── backtest.py     # AI backtesting engine
│   │   │   ├── optimize.py     # Portfolio optimization
│   │   │   ├── simulate.py     # Trading simulation
│   │   │   ├── stocks.py       # Stock data & search
│   │   │   ├── fetch.py        # Financial statements
│   │   │   └── agentic_rag.py  # AI research assistant
│   │   └── data_lake/          # Vector DB & documents
│   └── run.py
│
├── frontend/                # Next.js 15 Monorepo
│   ├── apps/trader/        # Main trading application
│   │   ├── src/
│   │   │   ├── app/        # App router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/        # Utilities & services
│   └── packages/           # Shared packages
│       ├── ui/             # UI components
│       ├── types/          # TypeScript types
│       └── config/         # Shared configs
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- pnpm (recommended) or npm
- MongoDB (optional, for watchlists)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# - GOOGLE_API_KEY (for Gemini AI)

# Run the server
python run.py
```

The API will be available at `http://localhost:5001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Set up environment variables
cp apps/trader/.env.local.example apps/trader/.env.local
# Edit with your configuration

# Run development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Backtesting
```
POST /backtest
{
  "query": "Buy when RSI < 30 and price above 200 SMA, sell when RSI > 70",
  "tickers": ["RELIANCE.NS", "TCS.NS", "INFY.NS"],
  "period": "2y",
  "capital": 10000
}
```

### Portfolio Optimization
```
POST /optimize
{
  "tickers": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"],
  "capital": 100000
}
```

### Stock Search
```
GET /stocks/search?q=reliance
```

### Financial Data
```
GET /fetch/balance-sheet?ticker=RELIANCE.NS
GET /fetch/cash-flow?ticker=RELIANCE.NS
GET /fetch/income-statement?ticker=RELIANCE.NS
```

## 📦 Tech Stack

### Backend
- **Flask** - Web framework
- **yfinance** - Stock data
- **backtesting.py** - Strategy backtesting
- **scipy** - Portfolio optimization
- **Google Gemini** - AI strategy generation
- **LangChain** - RAG pipeline

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Recharts** - Charts
- **TanStack Query** - Data fetching
- **Mongoose** - MongoDB ODM

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
GOOGLE_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/apps/trader/.env.local`)
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
