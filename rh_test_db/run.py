from src import app

# starting if this file is run directly using python run.py
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)