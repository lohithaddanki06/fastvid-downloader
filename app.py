from flask import Flask, render_template, request, jsonify, send_from_directory
from downloadercode import download_file
import os

app = Flask(__name__)
DOWNLOAD_FOLDER = 'downloads'
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download():
    url = request.form.get('url')
    platform = request.form.get('platform')
    content_type = request.form.get('contentType')

    if not url or not platform or not content_type:
        return jsonify(success=False, error="Incomplete form data."), 400
    if platform not in url.lower():
        return jsonify(success=False, error=f"URL must be from {platform}"), 400

    try:
        filename = download_file(url, platform, content_type, DOWNLOAD_FOLDER)
        return jsonify(success=True, filename=filename)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

@app.route('/download/<filename>')
def serve_file(filename):
    try:
        return send_from_directory(DOWNLOAD_FOLDER, filename, as_attachment=True)
    except Exception as e:
        return f"File not found: {str(e)}", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
