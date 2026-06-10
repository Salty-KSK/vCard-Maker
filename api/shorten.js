module.exports = async function handler(req, res) {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const response = await fetch(
            `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`
        );

        if (!response.ok) {
            throw new Error(`is.gd responded with ${response.status}`);
        }

        const data = await response.json();

        // is.gd returns { shorturl: "..." } on success, or { errorcode: ..., errormessage: "..." } on failure
        if (data.errorcode) {
            throw new Error(data.errormessage || 'is.gd error');
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Shorten error:', error.message);
        return res.status(500).json({ error: error.message || 'Failed to shorten URL' });
    }
};
