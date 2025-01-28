const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public')); // Serve the frontend

// Route for fetching video details
app.get('/info', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'video');

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            formats: formats.map(f => ({ quality: f.qualityLabel, itag: f.itag })),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

// Route for downloading video
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'highest';

    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Clean title

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(videoURL, { quality, filter: 'video' }).pipe(res);
    } catch (err) {
        res.status(500).send('Error processing download');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
