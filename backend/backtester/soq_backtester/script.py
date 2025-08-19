import pandas as pd
from typing import Tuple
import numpy as np

class Strategy():
   
   def process_data(self, data) -> pd.DataFrame:
      return data
   
   def get_signals(self, tradingState: dict) -> Tuple[list, str]:

      tickers = tradingState['positions'].index
      
      # Create equal weight signals for all stocks
      num_tickers = len(tickers)
      signal = pd.Series(np.nan, index=tickers)  # Initialize with NaN
      
      if int(tradingState['traderData'])%14 == 0:
         signal = pd.Series([np.nan]*(num_tickers-2) + [0.0,1.0], index=tickers) # Equal weight for each stock
      elif int(tradingState['traderData'])%3 == 0:
         signal = pd.Series(1 / num_tickers, index=tickers)
      
      traderData = int(tradingState['traderData']) + 1
      # Trader data can be updated or left as an empty string
      
      return signal, traderData