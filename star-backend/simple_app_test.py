from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "STAR Platform Backend is running!",
        "database": True,
        "static_files": True,
        "version": "1.0.0"
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "database": True,
        "static_files": True
    })

@app.route('/api/v1/status')  
def api_status():
    return jsonify({
        "api_version": "v1",
        "status": "active",
        "database": True,
        "static_files": True
    })

# Create application for Azure App Service (WSGI)
application = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)