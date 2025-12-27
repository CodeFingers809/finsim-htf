# AI-Powered Agentic Backtesting Pipeline - Maximum Functionality
!pip install -q backtesting backtrader yfinance groq pandas numpy matplotlib plotly ta-lib 2>&1 | grep -v "already satisfied" || true

import warnings
import sys

def warning_handler(message, category, filename, lineno, file=None, line=None):
    return
warnings.showwarning = warning_handler
warnings.filterwarnings('ignore')
warnings.simplefilter('ignore')

from backtesting import Backtest, Strategy
import backtrader as bt
import re, yfinance as yf, pandas as pd, numpy as np
from groq import Groq
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import json

# ----------------- PRE-CONFIGURED SETTINGS -----------------
client = Groq(api_key="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")

NSE_SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HINDUNILVR.NS', 'ITC.NS']
INITIAL_CASH = 10000
MAX_ITERATIONS = 4

# ----------------- COMPREHENSIVE FEW-SHOT EXAMPLES -----------------
FEW_SHOT_EXAMPLES = """
FRAMEWORK: We support both backtesting.py and backtrader for maximum flexibility.

=== BACKTESTING.PY EXAMPLES ===

EXAMPLE 1: MACD Strategy with Signal Line
class UserStrategy(Strategy):
    def init(self):
        def ema(arr, n):
            return pd.Series(arr).ewm(span=n).mean().values
        
        # MACD components
        def macd_line(close):
            ema12 = pd.Series(close).ewm(span=12).mean()
            ema26 = pd.Series(close).ewm(span=26).mean()
            return (ema12 - ema26).values
        
        def signal_line(close):
            macd = pd.Series(close).ewm(span=12).mean() - pd.Series(close).ewm(span=26).mean()
            return macd.ewm(span=9).mean().values
        
        self.ema50 = self.I(ema, self.data.Close, 50)
        self.macd = self.I(macd_line, self.data.Close)
        self.signal = self.I(signal_line, self.data.Close)
    
    def next(self):
        if len(self.data.Close) < 50:
            return
        
        price = self.data.Close[-1]
        
        # Entry: MACD crosses above signal AND price above EMA50
        if not self.position:
            macd_cross_up = self.macd[-1] > self.signal[-1] and self.macd[-2] <= self.signal[-2]
            above_ema = price > self.ema50[-1]
            
            if macd_cross_up and above_ema:
                self.buy(tp=price*1.05, sl=price*0.98)
        
        # Exit: MACD crosses below signal
        elif self.position:
            macd_cross_down = self.macd[-1] < self.signal[-1] and self.macd[-2] >= self.signal[-2]
            if macd_cross_down:
                self.position.close()

EXAMPLE 2: Multi-Timeframe RSI Strategy
class UserStrategy(Strategy):
    def init(self):
        def rsi(arr, period=14):
            delta = pd.Series(arr).diff()
            gain = delta.where(delta > 0, 0).rolling(period).mean()
            loss = -delta.where(delta < 0, 0).rolling(period).mean()
            rs = gain / loss
            return (100 - 100/(1 + rs)).values
        
        def sma(arr, n):
            return pd.Series(arr).rolling(n).mean().values
        
        self.rsi14 = self.I(rsi, self.data.Close, 14)
        self.rsi28 = self.I(rsi, self.data.Close, 28)
        self.sma200 = self.I(sma, self.data.Close, 200)
    
    def next(self):
        if len(self.data.Close) < 200:
            return
        
        price = self.data.Close[-1]
        
        if not self.position:
            # Both RSIs oversold AND price above long-term trend
            if self.rsi14[-1] < 30 and self.rsi28[-1] < 40 and price > self.sma200[-1]:
                self.buy(tp=price*1.08, sl=price*0.96)
        
        elif self.position:
            # Either RSI overbought
            if self.rsi14[-1] > 70 or self.rsi28[-1] > 60:
                self.position.close()

EXAMPLE 3: Volatility Breakout with ATR
class UserStrategy(Strategy):
    def init(self):
        def atr(high, low, close, period=14):
            h = pd.Series(high)
            l = pd.Series(low)
            c = pd.Series(close)
            tr1 = h - l
            tr2 = abs(h - c.shift())
            tr3 = abs(l - c.shift())
            tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
            return tr.rolling(period).mean().values
        
        def sma(arr, n):
            return pd.Series(arr).rolling(n).mean().values
        
        self.sma20 = self.I(sma, self.data.Close, 20)
        self.atr = self.I(atr, self.data.High, self.data.Low, self.data.Close, 14)
    
    def next(self):
        if len(self.data.Close) < 50:
            return
        
        price = self.data.Close[-1]
        
        if not self.position:
            # Breakout: price crosses above SMA20 with high volatility
            breakout = price > self.sma20[-1] and self.data.Close[-2] <= self.sma20[-2]
            high_volatility = self.atr[-1] > self.atr[-10:].mean()
            
            if breakout and high_volatility:
                # Dynamic stop based on ATR
                atr_val = self.atr[-1]
                self.buy(tp=price + 2*atr_val, sl=price - 1.5*atr_val)
        
        elif self.position:
            # Exit on trend reversal
            if price < self.sma20[-1] and self.data.Close[-2] >= self.sma20[-2]:
                self.position.close()

=== BACKTRADER EXAMPLES (for advanced features like shorting) ===

EXAMPLE 4: Long-Short MACD Strategy
class UserStrategy(bt.Strategy):
    def __init__(self):
        self.macd = bt.indicators.MACD(self.data.close)
        self.ema50 = bt.indicators.EMA(self.data.close, period=50)
    
    def next(self):
        if not self.position:
            # Long: MACD crosses above zero and price above EMA
            if self.macd.macd[0] > 0 and self.macd.macd[-1] <= 0 and self.data.close[0] > self.ema50[0]:
                self.buy()
            
            # Short: MACD crosses below zero and price below EMA
            elif self.macd.macd[0] < 0 and self.macd.macd[-1] >= 0 and self.data.close[0] < self.ema50[0]:
                self.sell()
        
        elif self.position:
            # Close long positions
            if self.position.size > 0:
                if self.macd.macd[0] < 0 or self.data.close[0] < self.ema50[0]:
                    self.close()
            
            # Close short positions
            elif self.position.size < 0:
                if self.macd.macd[0] > 0 or self.data.close[0] > self.ema50[0]:
                    self.close()
"""

# ----------------- AGENTIC SYSTEM WITH DEEP REASONING -----------------
AGENT_SYSTEM_PROMPT = """You are an elite quantitative trading strategist with expertise in technical analysis, signal processing, and market microstructure. You output python code with no formatting, comments or text explanation.

AVAILABLE FRAMEWORKS:
1. backtesting.py: Fast, vectorized, good for simple strategies
   - Long-only positions
   - Use self.buy() and self.position.close()
   - Indicators must return .values (numpy arrays)
   - Position access: Check existence with 'if self.position:', close with 'self.position.close()'
   - DO NOT access position.avg_price or other attributes - they don't exist in backtesting.py
   - For entry price tracking, use self.data.Close[-1] at entry time

2. backtrader: Full-featured, supports shorting, complex order types
   - Both long and short positions
   - Use self.buy() and self.sell() for entries
   - Built-in indicators: bt.indicators.MACD, bt.indicators.RSI, etc.
   - Access current bar: self.data.close[0], previous: self.data.close[-1]
   - Position attributes: self.position.size (positive for long, negative for short)

CHOOSE THE RIGHT FRAMEWORK:
- Use backtesting.py for: Simple long-only strategies, fast execution
- Use backtrader for: Short-selling, complex order management, advanced features

TECHNICAL ANALYSIS PRINCIPLES:
1. Signal Quality: Combine multiple indicators to reduce false signals
2. Trend Alignment: Trade with the prevailing trend (use higher timeframe filters)
3. Risk Management: Dynamic stops based on volatility (ATR)
4. Entry Confirmation: Wait for multiple conditions to align
5. Exit Strategy: Clear exit rules, don't just rely on stops

INDICATOR CALCULATION BEST PRACTICES:
- MACD: EMA(12) - EMA(26), Signal: EMA(MACD, 9)
- RSI: Momentum indicator, overbought >70, oversold <30
- ATR: Measure volatility for dynamic position sizing
- Bollinger Bands: Volatility bands for mean reversion
- Volume: Confirm price movements with volume

You will iteratively analyze results and improve strategies based on:
- Trade frequency (too many/too few signals)
- Win rate (signal quality)
- Risk-adjusted returns (Sharpe ratio)
- Maximum drawdown (risk management)"""

def generate_strategy_agentic(user_query, iteration=1, previous_code=None, previous_results=None, execution_errors=None):
    """Generate strategy code with deep agentic reasoning"""
    
    if iteration == 1:
        prompt = f"""Design a robust trading strategy for: "{user_query}"

ANALYSIS PHASE:
1. Identify entry signals (what conditions trigger a buy/sell?)
2. Identify exit signals (when to close positions?)
3. Determine if short-selling is needed (choose framework accordingly)
4. Select appropriate indicators
5. Define risk management (stop loss, take profit)

TECHNICAL DESIGN:
- Break down the strategy into clear logical components
- Use multiple indicator confirmations to avoid false signals
- Consider trend filters for better signal quality
- Implement proper crossover detection
- Add data length checks to avoid index errors

FEW-SHOT EXAMPLES:
{FEW_SHOT_EXAMPLES}

IMPLEMENTATION:
Generate complete, production-ready code. Think step-by-step:
1. Which framework is best suited? (backtesting.py or backtrader?)
2. What indicators are needed?
3. How to detect crossovers/signals correctly?
4. What confirmations improve signal quality?

Output: Clean, well-commented code following the examples. You must not generate any text, your output should be directly the relevant python code. No formatting strictly."""

    else:
        error_analysis = ""
        if execution_errors:
            error_analysis = f"""
EXECUTION ERRORS FROM PREVIOUS ITERATION:
{execution_errors}

CRITICAL ERROR FIXES:
- "'Position' object has no attribute 'avg_price'": In backtesting.py, Position objects have NO attributes
  * Don't use: position.avg_price, position.size, position.entry_price, etc.
  * DO use: 'if self.position:' to check if position exists
  * DO use: 'self.position.close()' to close position
  * For price tracking: save self.data.Close[-1] in self.init() or when entering
  
- "index out of bounds": Add proper data length checks (if len(self.data.Close) < N)
- "Indicators must return numpy arrays": Ensure all indicators end with .values
- "Short orders": Use backtrader framework for shorting, not backtesting.py

FRAMEWORK RULES:
- backtesting.py: NEVER access position attributes, only check existence and close
- backtrader: Can use self.position.size for position info
"""

        prompt = f"""ITERATION {iteration}: Analyze and improve the strategy.

ORIGINAL GOAL: {user_query}

PREVIOUS CODE:
```python
{previous_code}
```

BACKTEST RESULTS:
- Total Trades: {previous_results.get('trades', 0)}
- Profitable Symbols: {previous_results.get('profitable', 0)}/{previous_results.get('total_symbols', 0)}
- Avg Return: {previous_results.get('avg_return', 0)}%
- Avg Sharpe: {previous_results.get('avg_sharpe', 0)}
- Avg Win Rate: {previous_results.get('avg_win_rate', 0)}%

{error_analysis}

FEW-SHOT EXAMPLES:
{FEW_SHOT_EXAMPLES}

DIAGNOSTIC ANALYSIS:

1. TRADE FREQUENCY DIAGNOSIS:
   - If 0 trades: Entry conditions never triggered
     * Check if crossover logic is inverted
     * Verify indicators are calculated correctly
     * Ensure data length checks aren't too restrictive
     * Print indicator values for debugging
   
   - If <5 trades/symbol: Too restrictive
     * Relax confirmation requirements
     * Check if multiple filters are conflicting
     * Consider lower timeframe signals
   
   - If >100 trades/symbol: Too many signals
     * Add trend filters
     * Increase confirmation requirements
     * Add cooldown period between trades

2. PROFITABILITY DIAGNOSIS:
   - If negative returns: Poor signal quality
     * Add trend alignment filter
     * Increase confirmation requirements
     * Improve entry timing (wait for pullbacks)
     * Review stop loss placement
   
   - If low win rate (<40%): False signals
     * Combine multiple indicators
     * Use momentum confirmation
     * Add volume filters

3. TECHNICAL FIXES:
   - Review indicator calculations (correct formulas?)
   - Check crossover detection (current vs previous comparison)
   - Verify framework choice (need backtrader for shorts?)
   - Add defensive checks for edge cases

IMPROVEMENT STRATEGY:
Based on the diagnosis above, generate IMPROVED code that addresses the specific issues.
Consider switching frameworks if current approach has limitations.
Add more sophisticated filters and confirmations.

Output: Enhanced code with fixes. No explanation, just the code. No formatting. """

    try:
        r = client.chat.completions.create(
            messages=[
                {"role": "system", "content": AGENT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.15,
            max_tokens=3000
        )
        
        code = r.choices[0].message.content.strip()
        
        # Extract code from markdown
        code = re.sub(r"```python\n", "", code)
        code = re.sub(r"```\n", "", code)
        code = re.sub(r"^```.*\n", "", code, flags=re.MULTILINE)
        code = code.strip()
        
        # Detect framework
        if 'bt.Strategy' in code or 'backtrader' in code:
            return 'backtrader', code
        else:
            return 'backtesting', code
            
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return None, None

def create_backtesting_strategy(code):
    """Create backtesting.py strategy class"""
    try:
        # Clean imports
        code = re.sub(r"^(?:from|import)\s+.*?\n", "", code, flags=re.MULTILINE)
        
        # Extract class
        lines = code.split('\n')
        class_lines = []
        in_class = False
        for line in lines:
            if 'class UserStrategy' in line:
                in_class = True
                class_lines.append(line.replace('bt.Strategy', 'Strategy'))
            elif in_class:
                if class_lines and line and not line[0].isspace() and not line.startswith('class'):
                    break
                class_lines.append(line)
        
        final_code = '\n'.join(class_lines).strip()
        ns = {'Strategy': Strategy, 'pd': pd, 'np': np}
        exec(final_code, ns)
        return ns.get('UserStrategy'), final_code
    except Exception as e:
        return None, f"Compilation error: {e}\nCode:\n{code}"

def create_backtrader_strategy(code):
    """Create backtrader strategy class"""
    try:
        # Keep bt imports
        code_lines = []
        for line in code.split('\n'):
            if not line.strip().startswith('import backtrader'):
                code_lines.append(line)
        
        code = '\n'.join(code_lines)
        
        # Extract class
        lines = code.split('\n')
        class_lines = []
        in_class = False
        for line in lines:
            if 'class UserStrategy' in line:
                in_class = True
                class_lines.append(line)
            elif in_class:
                if class_lines and line and not line[0].isspace() and not line.startswith('class'):
                    break
                class_lines.append(line)
        
        final_code = '\n'.join(class_lines).strip()
        ns = {'bt': bt}
        exec(final_code, ns)
        return ns.get('UserStrategy'), final_code
    except Exception as e:
        return None, f"Compilation error: {e}\nCode:\n{code}"

def run_backtesting_test(sym, Cls, start, end, cash=10000):
    """Run backtesting.py backtest"""
    try:
        df = yf.download(sym, start=start, end=end, progress=False, auto_adjust=False)
        
        if df is None or len(df) < 50:
            return None, None
        
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        
        df.columns = [col.strip() for col in df.columns]
        
        if 'Adj Close' in df.columns:
            df['Close'] = df['Adj Close']
        
        required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
        df = df[[col for col in required_cols if col in df.columns]]
        
        if len(df) < 50:
            return None, None

        bt_test = Backtest(df, Cls, cash=cash, commission=.001)
        s = bt_test.run()
        
        final = float(s['Equity Final [$]'])
        pnl = final - cash
        bh_ret = float((df['Close'].iloc[-1] - df['Close'].iloc[0]) / df['Close'].iloc[0] * 100)
        
        result = {
            'Symbol': sym,
            'Strategy_Return_%': round((final/cash - 1)*100, 2),
            'BuyHold_Return_%': round(bh_ret, 2),
            'Sharpe': round(float(s.get('Sharpe Ratio', 0)), 2),
            'Win_Rate_%': round(float(s.get('Win Rate [%]', 0)), 1),
            'Max_DD_%': round(float(s.get('Max. Drawdown [%]', 0)), 2),
            'Trades': int(s.get('# Trades', 0)),
            'Start_Balance': cash,
            'End_Balance': round(final, 2),
            'PnL_$': round(pnl, 2)
        }
        
        equity_curve = s._equity_curve
        
        return result, equity_curve
    except Exception as e:
        return None, str(e)

def run_backtrader_test(sym, Cls, start, end, cash=10000):
    """Run backtrader backtest"""
    try:
        df = yf.download(sym, period="max", progress=False)
        
        if df is None or len(df) < 50:
            return None, None
        
        cerebro = bt.Cerebro()
        
        data = bt.feeds.PandasData(dataname=df)
        cerebro.adddata(data)
        
        cerebro.addstrategy(Cls)
        cerebro.broker.setcash(cash)
        cerebro.broker.setcommission(commission=0.001)
        
        start_value = cerebro.broker.getvalue()
        cerebro.run()
        end_value = cerebro.broker.getvalue()
        
        pnl = end_value - start_value
        returns = (end_value / start_value - 1) * 100
        bh_ret = float((df['Close'].iloc[-1] - df['Close'].iloc[0]) / df['Close'].iloc[0] * 100)
        
        result = {
            'Symbol': sym,
            'Strategy_Return_%': round(returns, 2),
            'BuyHold_Return_%': round(bh_ret, 2),
            'Sharpe': 0,  # Backtrader doesn't auto-calculate
            'Win_Rate_%': 0,
            'Max_DD_%': 0,
            'Trades': 0,  # Would need analyzer
            'Start_Balance': cash,
            'End_Balance': round(end_value, 2),
            'PnL_$': round(pnl, 2)
        }
        
        return result, None
    except Exception as e:
        return None, str(e)

def run_multi_backtest(framework, syms, Cls, start, end, cash):
    """Run backtests across multiple symbols"""
    results = []
    equity_curves = {}
    errors = []
    
    test_func = run_backtesting_test if framework == 'backtesting' else run_backtrader_test
    
    for sym in syms:
        r, equity = test_func(sym, Cls, start, end, cash)
        if r:
            results.append(r)
            if equity is not None:
                equity_curves[sym] = equity
        elif equity:
            errors.append(f"{sym}: {equity[:100]}")
    
    return pd.DataFrame(results), equity_curves, errors

def analyze_results(df):
    """Generate comprehensive analysis"""
    if df is None or (isinstance(df, pd.DataFrame) and df.empty):
        return {
            'trades': 0, 'profitable': 0, 'avg_return': 0, 
            'total_symbols': 0, 'avg_sharpe': 0, 'avg_win_rate': 0,
            'total_pnl': 0, 'max_dd': 0
        }
    
    return {
        'trades': int(df['Trades'].sum()),
        'profitable': int((df['PnL_$'] > 0).sum()),
        'total_symbols': len(df),
        'avg_return': round(df['Strategy_Return_%'].mean(), 2),
        'avg_sharpe': round(df['Sharpe'].mean(), 2),
        'avg_win_rate': round(df['Win_Rate_%'].mean(), 1),
        'total_pnl': round(df['PnL_$'].sum(), 2),
        'max_dd': round(df['Max_DD_%'].min(), 2)
    }

def plot_results(df, equity_curves, initial_cash):
    """Comprehensive visualization"""
    if df is None or df.empty:
        return
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    fig.suptitle('Agentic Backtesting Results', fontsize=16, fontweight='bold')
    
    # PnL bars
    ax1 = axes[0, 0]
    colors = ['green' if x > 0 else 'red' for x in df['PnL_$']]
    ax1.bar(df['Symbol'], df['PnL_$'], color=colors, alpha=0.7)
    ax1.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
    ax1.set_title('P&L by Symbol', fontweight='bold')
    ax1.set_ylabel('PnL ($)')
    ax1.grid(True, alpha=0.3)
    ax1.tick_params(axis='x', rotation=45)
    
    # Returns comparison
    ax2 = axes[0, 1]
    x = np.arange(len(df))
    width = 0.35
    ax2.bar(x - width/2, df['Strategy_Return_%'], width, label='Strategy', alpha=0.8, color='blue')
    ax2.bar(x + width/2, df['BuyHold_Return_%'], width, label='Buy & Hold', alpha=0.8, color='orange')
    ax2.set_title('Returns Comparison', fontweight='bold')
    ax2.set_ylabel('Return (%)')
    ax2.set_xticks(x)
    ax2.set_xticklabels(df['Symbol'], rotation=45)
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    ax2.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
    
    # Equity curves
    ax3 = axes[1, 0]
    for sym, equity in equity_curves.items():
        if equity is not None and 'Equity' in equity.columns:
            ax3.plot(equity.index, equity['Equity'], label=sym, alpha=0.7, linewidth=2)
    ax3.axhline(y=initial_cash, color='black', linestyle='--', linewidth=1, label='Initial', alpha=0.5)
    ax3.set_title('Equity Curves', fontweight='bold')
    ax3.set_ylabel('Account Value ($)')
    ax3.set_xlabel('Date')
    ax3.legend(fontsize=8)
    ax3.grid(True, alpha=0.3)
    
    # Metrics summary
    ax4 = axes[1, 1]
    ax4.axis('off')
    
    total_start = initial_cash * len(df)
    total_end = df['End_Balance'].sum()
    total_pnl = df['PnL_$'].sum()
    total_ret = ((total_end / total_start) - 1) * 100
    
    metrics_text = f"""
    PORTFOLIO METRICS
    {'='*45}
    
    Capital
      Initial:              ${total_start:>12,.2f}
      Final:                ${total_end:>12,.2f}
      Total P&L:            ${total_pnl:>12,.2f}
      Portfolio Return:     {total_ret:>12.2f}%
    
    Performance
      Avg Strategy Return:  {df['Strategy_Return_%'].mean():>12.2f}%
      Avg Buy & Hold:       {df['BuyHold_Return_%'].mean():>12.2f}%
      Avg Sharpe Ratio:     {df['Sharpe'].mean():>12.2f}
      Avg Win Rate:         {df['Win_Rate_%'].mean():>12.1f}%
    
    Trading Activity
      Total Trades:         {df['Trades'].sum():>12}
      Profitable Assets:    {(df['PnL_$'] > 0).sum():>12}/{len(df)}
      Success Rate:         {(df['PnL_$'] > 0).sum()/len(df)*100:>12.1f}%
    """
    
    ax4.text(0.05, 0.5, metrics_text, fontsize=10, verticalalignment='center',
             fontfamily='monospace', bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.3))
    
    plt.tight_layout()
    plt.show()

# ----------------- MAIN EXECUTION -----------------
print("🎯 AI-Powered Agentic Backtesting Pipeline")
print("   Maximum Functionality | Deep Analysis | Iterative Improvement\n")

strategy_input = input("Enter your trading strategy: ").strip()
if not strategy_input:
    strategy_input = "buy when MACD crosses above signal and price is above 50 EMA, sell when MACD crosses below signal"

symbols_input = input(f"Symbols (Enter for {len(NSE_SYMBOLS)} NSE stocks): ").strip()
if symbols_input:
    NSE_SYMBOLS = [s.strip().upper() for s in symbols_input.split(",")]

# Max data available
end_date = datetime.now().strftime('%Y-%m-%d')
start_date = (datetime.now() - timedelta(days=730)).strftime('%Y-%m-%d')

print(f"\n{'='*70}")
print(f"Strategy: {strategy_input}")
print(f"Period: {start_date} to {end_date}")
print(f"Universe: {len(NSE_SYMBOLS)} stocks | Capital: ${INITIAL_CASH}/stock")
print(f"{'='*70}\n")

# Agentic iteration loop
best_code = None
best_results = None
best_equity_curves = None
best_score = -float('inf')
best_framework = None

for iteration in range(1, MAX_ITERATIONS + 1):
    print(f"\n{'='*70}")
    print(f"🤖 ITERATION {iteration}/{MAX_ITERATIONS}")
    print(f"{'='*70}")
    
    # Generate strategy
    if iteration == 1:
        framework, code = generate_strategy_agentic(strategy_input, iteration)
    else:
        prev_errors = "\n".join(execution_errors) if execution_errors else None
        framework, code = generate_strategy_agentic(
            strategy_input, iteration, best_code, 
            analyze_results(best_results), prev_errors
        )
    
    if not framework or not code:
        print("❌ Failed to generate code")
        continue
    
    print(f"\n✅ Framework: {framework.upper()}")
    print(f"✅ Generated {len(code)} chars of code\n")
    print(f"{'-'*70}")
    print(code)
    print(f"{'-'*70}\n")
    
    # Compile strategy
    if framework == 'backtesting':
        UserStrategy, error = create_backtesting_strategy(code)
    else:
        UserStrategy, error = create_backtrader_strategy(code)
    
    if not UserStrategy:
        print(f"❌ Compilation failed: {error}\n")
        execution_errors = [error] if isinstance(error, str) else []
        continue
    
    print("✅ Compiled successfully\n")
    
    # Run backtests
    print(f"Testing {len(NSE_SYMBOLS)} symbols...\n")
    results, equity_curves, execution_errors = run_multi_backtest(
        framework, NSE_SYMBOLS, UserStrategy, start_date, end_date, INITIAL_CASH
    )
    
    if results.empty:
        print("❌ No successful backtests")
        if execution_errors:
            print("\nExecution errors:")
            for err in execution_errors[:3]:
                print(f"  • {err}")
        continue
    
    print(f"✓ {len(results)} symbols completed\n")
    
    # Analyze performance
    analysis = analyze_results(results)
    
    # Sophisticate
    #scoring: trade activity + profitability + risk-adjusted returns
    score = (
        analysis['trades'] * 0.3 +  # Trade activity
        analysis['profitable'] * 10 +  # Profitable symbols
        max(analysis['avg_return'], 0) * 0.5 +  # Returns
        max(analysis['avg_sharpe'], 0) * 5  # Risk-adjusted
    )
    
    print(f"📊 ITERATION {iteration} RESULTS:")
    print(f"  Trades: {analysis['trades']}")
    print(f"  Profitable: {analysis['profitable']}/{analysis['total_symbols']}")
    print(f"  Avg Return: {analysis['avg_return']}%")
    print(f"  Avg Sharpe: {analysis['avg_sharpe']}")
    print(f"  Total P&L: ${analysis['total_pnl']:.2f}")
    print(f"  Score: {score:.2f}")
    
    if score > best_score:
        best_score = score
        best_code = code
        best_results = results
        best_equity_curves = equity_curves
        best_framework = framework
        print(f"  ✨ NEW BEST STRATEGY! (Score: {score:.2f})")

# Final results
print(f"\n\n{'='*70}")
print("🏆 FINAL BEST STRATEGY")
print(f"{'='*70}")
print(f"Framework: {best_framework.upper() if best_framework else 'None'}\n")
print(best_code if best_code else "No successful strategy generated")

if best_results is not None and not best_results.empty:
    print(f"\n{'='*70}")
    print("FINAL PERFORMANCE")
    print(f"{'='*70}\n")
    
    tot = len(best_results)
    wins = (best_results['PnL_$'] > 0).sum()
    total_start = INITIAL_CASH * tot
    total_end = best_results['End_Balance'].sum()
    total_pnl = best_results['PnL_$'].sum()
    
    print(f"Portfolio:")
    print(f"  Initial Capital: ${total_start:,.2f}")
    print(f"  Final Value: ${total_end:,.2f}")
    print(f"  Total P&L: ${total_pnl:,.2f}")
    print(f"  Return: {((total_end/total_start - 1)*100):.2f}%")
    print(f"\nStatistics:")
    print(f"  Profitable Symbols: {wins}/{tot} ({wins/tot*100:.1f}%)")
    print(f"  Total Trades: {best_results['Trades'].sum()}")
    print(f"  Avg Sharpe: {best_results['Sharpe'].mean():.2f}")
    print(f"  Avg Win Rate: {best_results['Win_Rate_%'].mean():.1f}%")
    
    print(f"\n{'-'*70}")
    print("DETAILED RESULTS BY SYMBOL")
    print(f"{'-'*70}")
    print(best_results[['Symbol', 'PnL_$', 'Strategy_Return_%', 'BuyHold_Return_%', 'Sharpe', 'Win_Rate_%', 'Trades']].to_string(index=False))
    
    plot_results(best_results, best_equity_curves, INITIAL_CASH)
else:
    print("\n❌ No successful strategies generated across all iterations")
