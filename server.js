const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.'));

// Test route to verify server is working
app.get('/test', (req, res) => {
    res.send('Server is working!');
});

// Get video info first
app.get('/info', async (req, res) => {
    try {
        const url = req.query.url;
        console.log('Getting info for:', url);

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getBasicInfo(url);
        res.json({
            title: info.videoDetails.title,
            length: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[0].url
        });
    } catch (error) {
        console.error('Info error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Download route
app.get('/download', async (req, res) => {
    try {
        const url = req.query.url;
        console.log('Download request for:', url);

        if (!url) {
            return res.status(400).send('URL is required');
        }

        if (!ytdl.validateURL(url)) {
            return res.status(400).send('Invalid YouTube URL');
        }

        try {
            // Get video info with specific options
            const info = await ytdl.getInfo(url, {
                requestOptions: {
                    headers: {
                        cookie: '',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                }
            });

            const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');
            console.log('Video title:', title);

            // Get all formats with both audio and video
            const formats = info.formats.filter(format => 
                format.hasVideo && 
                format.hasAudio && 
                format.container === 'mp4'
            );

            if (formats.length === 0) {
                throw new Error('No suitable format found');
            }

            // Sort by quality (highest first) and pick the first one
            formats.sort((a, b) => {
                const qualityA = parseInt(a.height) || 0;
                const qualityB = parseInt(b.height) || 0;
                return qualityB - qualityA;
            });

            const format = formats[0];
            console.log('Selected format:', format.qualityLabel);

            // Set headers for forced download
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            res.header('Content-Type', 'video/mp4');

            // Create the download stream
            const stream = ytdl(url, {
                format: format,
                requestOptions: {
                    headers: {
                        cookie: '',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                }
            });

            // Handle stream errors
            stream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).send(err.message);
                }
            });

            // Log progress
            let downloaded = 0;
            stream.on('data', (chunk) => {
                downloaded += chunk.length;
                console.log('Downloaded:', Math.floor(downloaded / 1024 / 1024), 'MB');
            });

            // Handle stream end
            stream.on('end', () => {
                console.log('Download completed');
            });

            // Pipe the video stream to response
            stream.pipe(res);

        } catch (error) {
            console.error('Video error:', error);
            return res.status(500).send(error.message);
        }

    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) {
            res.status(500).send(error.message);
        }
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Server error: ' + err.message);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
