
const defaultStrategyCode = `# Sample Trading Strategy
def momentum_strategy(data):
    \"\"\"
    Simple momentum strategy
    Buy when price > 20-day moving average
    Sell when price < 20-day moving average
    \"\"\"
    signals = []
    for i in range(len(data)):
        if data[i].close > data[i].ma_20:
            signals.append("BUY")
        else:
            signals.append("SELL")
    return signals

# Run backtest
backtest_results = run_backtest(
    strategy=momentum_strategy,
    start_date="2023-01-01",
    end_date="2024-01-01",
    initial_capital=100000
)`;

export default defaultStrategyCode;
