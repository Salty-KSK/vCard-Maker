export default async function handler(req, res) {
    const { url } = req.query;

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
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to shorten URL' });
    }
}
