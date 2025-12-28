from flask import Blueprint, jsonify, request
import yfinance as yf
import pandas as pd

stocks_bp = Blueprint('stocks', __name__)

@stocks_bp.route('/stock/<ticker>/info', methods=['GET'])
def get_stock_info(ticker):
    """
    Get complete data (fundamentals) for a single stock.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return jsonify({'status': 'success', 'data': info})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stocks_bp.route('/stock/<ticker>/history', methods=['GET'])
def get_stock_history(ticker):
    """
    Get historical price data (OHLC + Volume) for a single stock.
    Query params:
    - period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max (default: max)
    - interval: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo (default: 1d)
    """
    period = request.args.get('period', 'max')
    interval = request.args.get('interval', '1d')
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)
        
        if hist.empty:
             return jsonify({'status': 'error', 'message': 'No data found'}), 404
        
        # Reset index to include Date/Datetime in the records
        hist.reset_index(inplace=True)
        
        # Convert to dict
        data = hist.to_dict(orient='records')
        
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@stocks_bp.route('/stocks/history', methods=['GET'])
def get_multiple_stocks_history():
    """
    Get historical price data for multiple stocks.
    Query params:
    - tickers: comma-separated list of tickers (e.g., AAPL,MSFT,GOOG)
    - period: default 1mo
    - interval: default 1d
    """
    tickers = request.args.get('tickers')
    if not tickers:
        return jsonify({'status': 'error', 'message': 'Tickers parameter is required'}), 400
    
    ticker_list = [t.strip() for t in tickers.split(',')]
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1d')
    
    try:
        result = {}
        
        # Fetch each ticker individually to get currency info
        for ticker in ticker_list:
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(period=period, interval=interval)
                
                if hist.empty:
                    continue
                
                # Get currency info from stock info
                info = stock.info
                currency = info.get('currency', 'USD')
                
                hist.reset_index(inplace=True)
                # Replace NaN with None for proper JSON serialization
                hist = hist.where(pd.notnull(hist), None)
                
                result[ticker] = {
                    'data': hist.to_dict(orient='records'),
                    'currency': currency
                }
            except Exception as e:
                print(f"Error fetching {ticker}: {e}")
                continue
        
        return jsonify({'status': 'success', 'data': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
