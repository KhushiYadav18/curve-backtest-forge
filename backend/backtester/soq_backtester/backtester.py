import pandas as pd
import numpy as np
import vectorbt as vbt
import tqdm
from tabulate import tabulate
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import script
import importlib
importlib.reload(script)
import scipy.stats as stats
import json

from script import Strategy 
import plotly.io as pio
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import datetime

class Backtester:
    def __init__(self, data: pd.DataFrame, initial_value: float):
        self.data = data
        self.portfolio_value = initial_value
        self.cash = initial_value
        self.investment = 0.0
        self.current_index = 1
        tickers = data.columns.get_level_values(0).unique()
        self.positions = pd.Series(0, index=tickers)
        self.all_positions = pd.DataFrame(columns=tickers)
        self.tradingState = {}
        self.dates = []
        self.portfolio_history = []
        self.cash_history = []
        self.investment_history = []
        self.all_signals = pd.DataFrame(columns=tickers)

    def calculate_positions(self, signal: pd.Series, value, open=True) -> pd.Series:
        if (signal < 0).any():
            raise ValueError(f'For timestamp {self.data.index[self.current_index]}, signal contains negative values: {signal[signal < 0]}')
        if not isinstance(signal, pd.Series):
            raise TypeError(f'For timestamp {self.data.index[self.current_index]}, signal must be a pandas Series, got {type(signal)}')
        if abs(signal).sum() - 1 > 1e-6:
            raise ValueError(f'For timestamp {self.data.index[self.current_index]} the sum of the abs(signals) must not be greater than 1, got {abs(signal).sum()}')

        prices = (
            self.data.xs('open', level=1, axis=1).iloc[self.current_index]
            if open
            else self.data.xs('close', level=1, axis=1).iloc[self.current_index]
        )
        prices = prices.reindex(signal.index)
        
        nan_index = signal.isna()
        value -= (self.positions[nan_index]*prices[nan_index]).sum()

        float_shares = (signal.replace(0,np.nan) * value) / prices.replace(0, np.nan)

        float_shares = (
            float_shares
            .replace([np.inf, -np.inf], 0)
            .fillna(0)
        )

        new_positions = pd.Series(0, index=float_shares.index, dtype=int)
        longs  = float_shares > 0
        shorts = float_shares < 0

        new_positions[longs]  = np.floor(float_shares[longs]).astype(int)
        new_positions[shorts] = np.ceil (float_shares[shorts]).astype(int)
        
        new_positions[nan_index] = self.positions[nan_index]

        return new_positions

    def calculate_cash(self, positions: pd.Series, open=True) -> float:
        index = self.current_index
        price = self.data.xs('open',level=1,axis=1).iloc[index] if open else self.data.xs('close',level=1,axis=1).iloc[index]
        return self.portfolio_value - (abs(positions) * price).sum()

    def update_investment(self, positions: pd.Series, new_day=False) -> float:
        index = self.current_index
        price1 = self.data.xs('close',level=1,axis=1).iloc[index-1] if new_day else self.data.xs('open',level=1,axis=1).iloc[index]
        price2 = self.data.xs('open',level=1,axis=1).iloc[index] if new_day else self.data.xs('close',level=1,axis=1).iloc[index]
        return (positions * (price2 - price1)).sum() + self.investment

    def run(self):
        processed_data = Strategy().process_data(self.data)
        self.all_positions.loc[self.data.index[0]] = self.positions
        traderData = 1
        for i in tqdm.tqdm(range(1, len(self.data))):
            self.tradingState = {
                'processed_data': processed_data[:i],
                'investment': self.investment,
                'cash': self.cash,
                'current_timestamp': self.data.index[self.current_index],
                'traderData': traderData,
                'positions': self.positions,
            }
            signal, traderData = Strategy().get_signals(self.tradingState)
            if signal is None:
                raise ValueError(f'For timestamp {self.data.index[self.current_index]}, signal is None')
            self.investment = self.update_investment(self.positions, new_day=True)
            self.portfolio_value = self.investment + self.cash
            self.positions = self.calculate_positions(signal, self.portfolio_value)
            self.cash = self.calculate_cash(self.positions)
            self.investment = self.portfolio_value - self.cash
            self.investment = self.update_investment(self.positions, new_day=False)
            self.portfolio_value = self.investment + self.cash
            self.all_positions.loc[self.data.index[i]] = self.positions
            self.all_signals.loc[self.data.index[i-1]] = signal
            self.current_index += 1

    def vectorbt_run(self):
        open_prices = self.data.xs('open', level=1, axis=1).loc[self.all_positions.index, self.all_positions.columns]
        close_prices = self.data.xs('close', level=1, axis=1).loc[self.all_positions.index, self.all_positions.columns]
        
        order_size = self.all_positions.diff().fillna(0).astype(int)
        order_size = order_size.mask(order_size == 0)
        
        portfolio = vbt.Portfolio.from_orders(
            close=close_prices,
            size=order_size,
            price=open_prices,
            init_cash=initial_value,
            freq='1D',
            cash_sharing=True,
            ffill_val_price=True,
            call_seq='auto',
            log=True,  
        )
        return portfolio
    
    def export_results(self, portfolio, save_path="frontend_data"):
        os.makedirs(save_path, exist_ok=True)
        charts_dir = os.path.join(save_path, "charts")
        plots_dir = os.path.join(save_path, "plots")
        os.makedirs(charts_dir, exist_ok=True)
        os.makedirs(plots_dir, exist_ok=True)

        # 1. Portfolio summary data
        equity = portfolio.value()
        returns = equity.pct_change().fillna(0)
        cum_max = equity.cummax()
        drawdown = (equity - cum_max) / cum_max

        portfolio_summary = pd.DataFrame({
            'date': equity.index,
            'equity': equity.values,
            'returns': returns.values,
            'drawdown': drawdown.values
        })
        portfolio_summary.to_csv(os.path.join(save_path, "portfolio_summary.csv"), index=False)
        
        # Save as JSON for frontend
        portfolio_json = portfolio_summary.to_dict(orient='records')
        with open(os.path.join(save_path, "portfolio_summary.json"), 'w') as f:
            json.dump(portfolio_json, f, default=str)  # default=str handles datetime conversion

        # 2. Export portfolio value breakdown
        df = pd.concat([portfolio.value(), portfolio.asset_value(), portfolio.cash()], axis=1)
        df.columns = ['portfolio', 'investment', 'cash']
        df.to_csv(os.path.join(save_path, "portfolio.csv"))
        
        # 3. Save signals
        self.all_signals.to_csv(os.path.join(save_path, "signals.csv"))
        
        # 4. Generate candlestick data for each ticker
        tickers = self.data.columns.get_level_values(0).unique()
        for ticker in tqdm.tqdm(tickers, desc="Exporting ticker charts"):
            ticker_data = self.get_candlestick_data(ticker)
            with open(os.path.join(charts_dir, f"{ticker}.json"), 'w') as f:
                json.dump(self.clean_for_json(ticker_data), f, default=str)


        # NEW: Generate returns histogram
        returns_histogram = self.generate_returns_histogram(portfolio_summary['returns'])
        with open(os.path.join(save_path, "returns_histogram.json"), 'w') as f:
            json.dump(returns_histogram, f)
        
        # Also save as CSV
        pd.DataFrame(returns_histogram).to_csv(os.path.join(save_path, "returns_histogram.csv"), index=False)
        
        # NEW: Generate performance metrics
        performance_metrics = self.calculate_performance_metrics(portfolio, portfolio_summary)
        safe_metrics = self.clean_for_json(performance_metrics)
        with open(os.path.join(save_path, "performance_metrics.json"), 'w') as f:
            json.dump(safe_metrics, f, indent=2, allow_nan=False)


        print(f"📁 Results exported to `{save_path}/`.")
        return portfolio_summary

    def generate_returns_histogram(self, returns_series: pd.Series, bins: int = 30) -> list:
        returns = returns_series.dropna()
        counts, bin_edges = np.histogram(returns, bins=bins)

        histogram = []
        for i in range(len(counts)):
            histogram.append({
                "bin_start": round(float(bin_edges[i]), 6),
                "bin_end": round(float(bin_edges[i + 1]), 6),
                "frequency": int(counts[i])
            })

        return histogram


    def get_candlestick_data(self, ticker: str) -> dict:
        ohlcv = self.data[ticker][["open", "high", "low", "close"]].copy()
        ohlcv.index = pd.to_datetime(ohlcv.index)
        pos = self.all_positions[ticker].reindex(ohlcv.index).ffill().fillna(0)
        
        # Remove weekends
        mask = ohlcv.index.weekday < 5
        ohlcv = ohlcv.loc[mask]
        pos = pos.loc[mask]
        
        # Create dataframe with all data
        df = ohlcv.assign(position=pos)
        df["action"] = "hold"
        df["dpos"] = df["position"].diff().fillna(df["position"])
        
        # Identify buy/sell actions
        df.loc[df["dpos"] > 0, "action"] = "buy"
        df.loc[df["dpos"] < 0, "action"] = "sell"
        
        # Identify holding periods
        df["holding"] = df["position"] != 0
        df["grp"] = (df["holding"] != df["holding"].shift(fill_value=False)).cumsum()
        
        holdings = []
        for _, sub in df.groupby("grp"):
            if sub["holding"].iat[0]:
                holdings.append({
                    "start": sub.index[0].strftime("%Y-%m-%d"),
                    "end": sub.index[-1].strftime("%Y-%m-%d"),
                    "position": sub["position"].mean()
                })
        
        # Convert to frontend-friendly format
        data = []
        for date, row in df.iterrows():
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": row["open"],
                "high": row["high"],
                "low": row["low"],
                "close": row["close"],
                "position": row["position"],
                "action": row["action"]
            })
        
        return {
            "ticker": ticker,
            "data": data,
            "holdings": holdings
        }
    
    def calculate_performance_metrics(self, portfolio, portfolio_summary):
        # Get portfolio statistics
        stats_df = portfolio.stats().to_frame(name='Value').reset_index()
        stats_df.columns = ['Metric', 'Value']
        
        # Convert stats to a dictionary for easier access
        stats_dict = dict(zip(stats_df['Metric'], stats_df['Value']))
        
        # Extract key metrics from portfolio stats
        metrics = {
            'initial_value': portfolio.init_cash,
            'final_value': portfolio.value().iloc[-1],
            'total_return_pct': portfolio.total_return() * 100,
            'cagr': portfolio.annualized_return() * 100,
            'volatility_pct': portfolio.annualized_volatility() * 100,
            'sharpe_ratio': portfolio.sharpe_ratio(),
            'sortino_ratio': portfolio.sortino_ratio(),
            'max_drawdown_pct': portfolio.max_drawdown() * 100,
            'calmar_ratio': portfolio.calmar_ratio(),
            'total_trades': stats_dict.get('Total Trades', 0),
            'win_rate_pct': stats_dict.get('Win Rate [%]', 0),
            'profit_factor': stats_dict.get('Profit Factor', 0)
        }
        
        # Additional metrics from returns
        returns = portfolio_summary['returns'].dropna()
        if len(returns) > 0:
            metrics['skewness'] = stats.skew(returns)
            metrics['kurtosis'] = stats.kurtosis(returns, fisher=False)
            metrics['var_95'] = np.percentile(returns, 5) * 100
            cvar_95 = returns[returns <= np.percentile(returns, 5)].mean()
            metrics['cvar_95'] = cvar_95 * 100 if not pd.isna(cvar_95) else 0
        else:
            metrics['skewness'] = 0
            metrics['kurtosis'] = 0
            metrics['var_95'] = 0
            metrics['cvar_95'] = 0

        # Format metrics for frontend
        formatted_metrics = [
            {
                "metric": "Total Return",
                "value": f"{metrics['total_return_pct']:.2f}%",
                "description": "Total return over the period"
            },
            {
                "metric": "CAGR",
                "value": f"{metrics['cagr']:.2f}%",
                "description": "Compound Annual Growth Rate"
            },
            {
                "metric": "Volatility",
                "value": f"{metrics['volatility_pct']:.2f}%",
                "description": "Annualized standard deviation of returns"
            },
            {
                "metric": "Sharpe Ratio",
                "value": f"{metrics['sharpe_ratio']:.2f}",
                "description": "Risk-adjusted return (risk-free rate=0)"
            },
            {
                "metric": "Sortino Ratio",
                "value": f"{metrics['sortino_ratio']:.2f}",
                "description": "Adjusted for downside volatility"
            },
            {
                "metric": "Max Drawdown",
                "value": f"{metrics['max_drawdown_pct']:.2f}%",
                "description": "Maximum peak-to-trough decline"
            },
            {
                "metric": "Calmar Ratio",
                "value": f"{metrics['calmar_ratio']:.2f}",
                "description": "CAGR divided by max drawdown"
            },
            {
                "metric": "Win Rate",
                "value": f"{metrics['win_rate_pct']:.2f}%",
                "description": "Percentage of profitable trades"
            },
            {
                "metric": "Profit Factor",
                "value": f"{metrics['profit_factor']:.2f}",
                "description": "Gross profit divided by gross loss"
            },
            {
                "metric": "Total Trades",
                "value": f"{int(metrics['total_trades'])}",
                "description": "Number of completed trades"
            },
            {
                "metric": "Skewness",
                "value": f"{metrics['skewness']:.2f}",
                "description": "Measure of return distribution asymmetry"
            },
            {
                "metric": "Kurtosis",
                "value": f"{metrics['kurtosis']:.2f}",
                "description": "Measure of tail risk in return distribution"
            },
            {
                "metric": "VaR (95%)",
                "value": f"{metrics['var_95']:.2f}%",
                "description": "Worst expected loss at 95% confidence"
            },
            {
                "metric": "CVaR (95%)",
                "value": f"{metrics['cvar_95']:.2f}%",
                "description": "Average loss beyond VaR at 95% confidence"
            }
        ]
        
        return formatted_metrics

    def clean_for_json(self, obj):
        if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return None
        if isinstance(obj, dict):
            return {k: self.clean_for_json(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self.clean_for_json(v) for v in obj]
        return obj


# ... (keep all imports and class definition the same) ...

if __name__ == "__main__":
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the path to the data file
    data_path = os.path.join(script_dir,  "..", "..", 'data', 'multi_level_ohlcv.csv')
    
    # Verify the file exists
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at: {data_path}")
    
    # Load the data
    data = pd.read_csv(
        data_path,
        index_col=0, header=[0,1], parse_dates=True
    )[4500:]

    tickers = data.columns.get_level_values(0).unique()[100:200]
    data = data.loc[:, data.columns.get_level_values(0).isin(tickers)]

    initial_value = 200000.0
    backtester = Backtester(data, initial_value)
    backtester.run()
    pf = backtester.vectorbt_run()
    
    # FIX: Change save path to be outside the backtester directory
    save_path = os.path.join(script_dir, "..", "..", "data", "frontend_data")
    os.makedirs(save_path, exist_ok=True)
    backtester.export_results(pf, save_path=save_path)