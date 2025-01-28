const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend

// Route to download video/audio by URL
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'highest';
    const format = req.query.format || 'video';

    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title;

        res.header('Content-Disposition', `attachment; filename="${title}.${format === 'audio' ? 'mp3' : 'mp4'}"`);

        ytdl(videoURL, {
            quality: format === 'audio' ? 'highestaudio' : quality,
            filter: format === 'audio' ? 'audioonly' : 'video',
        }).pipe(res);
    } catch (err) {
        res.status(500).json({ error: 'Failed to process download' });
    }
});

// Route for video info (quality options)
app.get('/info', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL || !ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'video');
        const audioFormats = ytdl.filterFormats(info.formats, 'audio');

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            videoFormats: formats.map(f => ({ quality: f.qualityLabel, itag: f.itag })),
            audioFormats: audioFormats.map(f => ({ quality: 'High', itag: f.itag })),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
