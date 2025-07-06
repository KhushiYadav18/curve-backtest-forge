from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from utils import create_user, authenticate_user, logout_user, is_valid_email
import pandas as pd
import os
import json
import plotly
import numpy as np

from email.mime.text import MIMEText
from email_utils import send_email
import smtplib
import plotly.graph_objects as go
import os
from flask import send_file

import logging

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Updated import - removed get_candlestick_figure
from backtester.soq_backtester.backtester import Backtester
from backtester.soq_backtester.script import Strategy

app = Flask(__name__)
CORS(app)

# Configuration - make path absolute
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# FIX: Correct path to frontend data
FRONTEND_PATH = os.path.join(BASE_DIR, "data", "frontend_data")
PRELOADED_DATA = {}

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'GET':
        return "✅ Flask backend is running."
    return jsonify({'message': 'Backend running'}), 200
    

@app.route('/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()

        # Validate all fields
        if not all([name, email, subject, message]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        # Validate email format
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400

        # Admin Email
        admin_msg = (
            f"New message from {name} <{email}>\n\n"
            f"Subject: {subject}\n\n"
            f"Message:\n{message}"
        )
        
        # User Confirmation
        user_msg = (
            f"Hi {name},\n\n"
            f"Thanks for contacting QuantEdge! We've received your message:\n\n"
            f"\"{message}\"\n\n"
            f"We'll get back to you shortly.\n\n"
            f"– QuantEdge Team"
        )

        # Try sending admin email
        admin_sent = send_email("mansi24ecell@gmail.com", f"QuantEdge Contact: {subject}", admin_msg)
        
        if not admin_sent:
            # Log critical error
            logger.error(f"Failed to send admin email for contact form: {name} <{email}>")
            return jsonify({
                'success': False,
                'message': 'Failed to send your message. Please try again later.'
            }), 500

        # Try sending user confirmation
        user_sent = send_email(email, "Thanks for contacting QuantEdge", user_msg)
        
        if not user_sent:
            # Log warning but don't fail the request
            logger.warning(f"Sent message but failed to send confirmation to: {email}")

        return jsonify({
            'success': True,
            'message': 'Message sent successfully'
        }), 200

    except Exception as e:
        logger.exception("Unexpected error in contact form")
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    success, message = create_user(name, email, password)
    return jsonify({'success': success, 'message': message}), (200 if success else 409)

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required'}), 400

    success, message = authenticate_user(email, password)
    return jsonify({'success': success, 'message': message}), (200 if success else 401)

@app.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    email = data.get('email')

    success, message = logout_user(email)
    return jsonify({'success': success, 'message': message}), (200 if success else 400)


def load_precomputed_data():
    """Load all precomputed data into memory for faster access"""
    global PRELOADED_DATA
    
    try:
        # Portfolio summary data
        portfolio_path = os.path.join(FRONTEND_PATH, "portfolio_summary.json")
        if os.path.exists(portfolio_path):
            with open(portfolio_path) as f:
                PRELOADED_DATA['portfolio_summary'] = json.load(f)
        else:
            app.logger.warning(f"Portfolio summary not found at: {portfolio_path}")
        
        # Candlestick tickers
        charts_dir = os.path.join(FRONTEND_PATH, "charts")
        if os.path.exists(charts_dir):
            PRELOADED_DATA['tickers'] = [
                f.replace(".json", "") 
                for f in os.listdir(charts_dir) 
                if f.endswith(".json")
            ]
        else:
            app.logger.warning(f"Charts directory not found: {charts_dir}")

          # NEW: Load returns histogram data
        histogram_path = os.path.join(FRONTEND_PATH, "returns_histogram.json")
        if os.path.exists(histogram_path):
            with open(histogram_path) as f:
                PRELOADED_DATA['returns_histogram'] = json.load(f)
        else:
            app.logger.warning(f"Returns histogram not found at: {histogram_path}")

        # Load performance metrics
        metrics_path = os.path.join(FRONTEND_PATH, "performance_metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path) as f:
                PRELOADED_DATA['performance_metrics'] = json.load(f)
        else:
            app.logger.warning(f"Performance metrics not found at: {metrics_path}")
    except Exception as e:
        app.logger.error(f"Error loading precomputed data: {e}")

# FIX: Change endpoint name to match frontend
@app.route('/portfolio_summary', methods=['GET', 'POST'])
def get_portfolio_summary():
    """Get portfolio summary data"""
    if 'portfolio_summary' in PRELOADED_DATA:
        return jsonify(PRELOADED_DATA['portfolio_summary'])
    return jsonify({'error': 'Portfolio data not available'}), 404



@app.route('/tickers', methods=['GET'])
def get_tickers():
    """Get list of available tickers"""
    if 'tickers' in PRELOADED_DATA:
        return jsonify(PRELOADED_DATA['tickers'])
    return jsonify({'error': 'Ticker data not available'}), 404

@app.route('/candlestick/<ticker>', methods=['GET'])
def get_candlestick(ticker):
    """Get candlestick data for a specific ticker"""
    try:
        file_path = os.path.join(FRONTEND_PATH, "charts", f"{ticker}.json")
        if not os.path.exists(file_path):
            return jsonify({'error': 'Ticker not found'}), 404
        
        with open(file_path) as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/returns_histogram', methods=['GET'])
def get_returns_histogram():
    """Get returns histogram data"""
    if 'returns_histogram' in PRELOADED_DATA:
        return jsonify(PRELOADED_DATA['returns_histogram'])
    return jsonify({'error': 'Returns histogram data not available'}), 404

@app.route('/performance_metrics', methods=['GET'])
def get_performance_metrics():
    if 'performance_metrics' in PRELOADED_DATA:
        return jsonify(PRELOADED_DATA['performance_metrics'])
    return jsonify({'error': 'Performance metrics not available'}), 404

@app.route('/run-backtest', methods=['POST'])
def run_backtest():
    """Endpoint to run a new backtest (optional)"""
    try:
        # This would run a new backtest with custom parameters
        # For now, just reload the precomputed data
        load_precomputed_data()
        return jsonify({'status': 'success', 'message': 'Backtest results reloaded'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs(FRONTEND_PATH, exist_ok=True)
    
    # Load precomputed data on startup
    print("Loading precomputed backtest data...")
    load_precomputed_data()
    
    # Check if data loaded successfully
    if PRELOADED_DATA:
        print(f"✅ Loaded data for {len(PRELOADED_DATA.get('tickers', []))} tickers")
    else:
        print("⚠️ Warning: No precomputed data loaded")
    
    print("Starting Flask server on port 5001...")
    app.run(debug=True, port=5001, use_reloader=True)