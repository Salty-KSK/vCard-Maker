const https = require('https');

function shortenWithTinyURL(targetUrl) {
    return new Promise((resolve, reject) => {
        const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(targetUrl)}`;
        
        https.get(apiUrl, (resp) => {
            let data = '';
            resp.on('data', (chunk) => { data += chunk; });
            resp.on('end', () => {
                const shortUrl = data.trim();
                if (resp.statusCode === 200 && shortUrl.startsWith('http')) {
                    resolve(shortUrl);
                } else {
                    reject(new Error(`TinyURL error: ${resp.statusCode} - ${shortUrl}`));
                }
            });
        }).on('error', (err) => {
            reject(new Error(`TinyURL request failed: ${err.message}`));
        });
    });
}

module.exports = async function handler(req, res) {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const shortUrl = await shortenWithTinyURL(url);
        return res.status(200).json({ shorturl: shortUrl });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
