const https = require('https');

function shortenUrl(targetUrl) {
    return new Promise((resolve, reject) => {
        // da.gd produces short URLs like https://da.gd/xxxxx (22 chars)
        const apiUrl = `https://da.gd/s?url=${encodeURIComponent(targetUrl)}`;

        https.get(apiUrl, (resp) => {
            let data = '';
            resp.on('data', (chunk) => { data += chunk; });
            resp.on('end', () => {
                const shortUrl = data.trim();
                if (resp.statusCode === 200 && shortUrl.startsWith('http')) {
                    resolve(shortUrl);
                } else {
                    reject(new Error(`da.gd error: ${resp.statusCode} - ${shortUrl}`));
                }
            });
        }).on('error', (err) => {
            reject(new Error(`da.gd request failed: ${err.message}`));
        });
    });
}

function shortenUrlFallback(targetUrl) {
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

    // Try da.gd first (shortest URLs, ~22 chars), fallback to TinyURL
    try {
        const shortUrl = await shortenUrl(url);
        return res.status(200).json({ shorturl: shortUrl });
    } catch (err1) {
        try {
            const shortUrl = await shortenUrlFallback(url);
            return res.status(200).json({ shorturl: shortUrl });
        } catch (err2) {
            return res.status(500).json({ error: err2.message });
        }
    }
};
