from flask import Flask, request, send_file, render_template_string
from pytube import YouTube
import os

app = Flask(__name__)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Video Downloader</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #8b0000, #400000);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            width: 90%;
            max-width: 600px;
            padding: 2rem;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .download-box {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        }
        
        input[type="url"] {
            width: 100%;
            padding: 12px;
            margin-bottom: 1rem;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            background: rgba(255,255,255,0.9);
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        button:hover {
            background: #0056b3;
        }
        
        #status {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 5px;
            text-align: center;
        }
        
        .success {
            background: rgba(40,167,69,0.2);
            color: #98ff98;
        }
        
        .error {
            background: rgba(220,53,69,0.2);
            color: #ffcccb;
        }

        .video-info {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 5px;
            margin-top: 1rem;
            display: none;
        }

        .video-info img {
            width: 100%;
            max-width: 300px;
            border-radius: 5px;
            margin: 1rem 0;
        }

        .quality-select {
            width: 100%;
            padding: 8px;
            margin-bottom: 1rem;
            border-radius: 5px;
            background: rgba(255,255,255,0.9);
            border: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>YouTube Video Downloader</h1>
        <div class="download-box">
            <input type="url" id="urlInput" placeholder="Enter YouTube URL here..." required>
            <button onclick="getVideoInfo()">Get Video Info</button>
        </div>
        <div id="videoInfo" class="video-info"></div>
        <div id="status"></div>
    </div>

    <script>
        const urlInput = document.getElementById('urlInput');
        const videoInfo = document.getElementById('videoInfo');
        const status = document.getElementById('status');

        function showStatus(message, type) {
            status.textContent = message;
            status.className = type;
        }

        async function getVideoInfo() {
            const url = urlInput.value.trim();
            
            if (!url) {
                showStatus('Please enter a valid YouTube URL', 'error');
                return;
            }

            try {
                showStatus('Fetching video information...', 'success');
                const response = await fetch('/video-info?url=' + encodeURIComponent(url));
                const data = await response.json();

                if (data.error) {
                    showStatus(data.error, 'error');
                    return;
                }

                videoInfo.style.display = 'block';
                videoInfo.innerHTML = `
                    <h3>${data.title}</h3>
                    <img src="${data.thumbnail}" alt="Video thumbnail">
                    <select class="quality-select" id="qualitySelect">
                        ${data.streams.map(s => `
                            <option value="${s.itag}">${s.quality} - ${s.type}</option>
                        `).join('')}
                    </select>
                    <button onclick="downloadVideo()">Download Video</button>
                `;
            } catch (error) {
                showStatus('Error: ' + error.message, 'error');
            }
        }

        async function downloadVideo() {
            const url = urlInput.value.trim();
            const quality = document.getElementById('qualitySelect').value;
            
            showStatus('Starting download...', 'success');
            window.location.href = `/download?url=${encodeURIComponent(url)}&itag=${quality}`;
        }

        // Handle Enter key
        urlInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                getVideoInfo();
            }
        });
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/video-info')
def video_info():
    try:
        url = request.args.get('url')
        if not url:
            return {'error': 'URL is required'}, 400

        yt = YouTube(url)
        streams = []
        
        # Get both video and audio streams
        for stream in yt.streams.filter(progressive=True):
            streams.append({
                'itag': stream.itag,
                'quality': stream.resolution,
                'type': 'Video with Audio',
            })

        return {
            'title': yt.title,
            'thumbnail': yt.thumbnail_url,
            'streams': streams
        }
    except Exception as e:
        return {'error': str(e)}, 400

@app.route('/download')
def download():
    try:
        url = request.args.get('url')
        itag = request.args.get('itag')
        
        if not url or not itag:
            return 'Missing parameters', 400

        yt = YouTube(url)
        stream = yt.streams.get_by_itag(itag)
        
        if not stream:
            return 'Stream not found', 404

        # Download to a temporary file
        download_path = stream.download(
            output_path='downloads',
            filename=f'{yt.title}_{stream.resolution}'
        )
        
        return send_file(
            download_path,
            as_attachment=True,
            download_name=os.path.basename(download_path)
        )
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    os.makedirs('downloads', exist_ok=True)
    app.run(port=5000, debug=True)
