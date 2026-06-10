module.exports = async function handler(req, res) {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Try multiple shortener services in order
    const services = [
        {
            name: 'TinyURL',
            call: async (targetUrl) => {
                const resp = await fetch(
                    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(targetUrl)}`
                );
                if (!resp.ok) throw new Error(`TinyURL: HTTP ${resp.status}`);
                const shortUrl = (await resp.text()).trim();
                if (!shortUrl.startsWith('http')) throw new Error('TinyURL: invalid response');
                return shortUrl;
            }
        },
        {
            name: 'is.gd',
            call: async (targetUrl) => {
                const resp = await fetch(
                    `https://is.gd/create.php?format=json&url=${encodeURIComponent(targetUrl)}`
                );
                if (!resp.ok) throw new Error(`is.gd: HTTP ${resp.status}`);
                const data = await resp.json();
                if (data.errorcode || !data.shorturl) {
                    throw new Error(data.errormessage || 'is.gd error');
                }
                return data.shorturl;
            }
        }
    ];

    for (const service of services) {
        try {
            const shortUrl = await service.call(url);
            return res.status(200).json({ shorturl: shortUrl });
        } catch (error) {
            console.error(`${service.name} failed:`, error.message);
        }
    }

    return res.status(500).json({ error: 'All shortener services failed' });
};
