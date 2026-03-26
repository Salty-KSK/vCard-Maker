document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vcard-form');
    const resultSection = document.getElementById('result-section');
    const generatedUrlInput = document.getElementById('generated-url');
    const copyBtn = document.getElementById('copy-btn');
    const copyMsg = document.getElementById('copy-msg');
    const previewLink = document.getElementById('preview-link');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values
        const name = document.getElementById('name').value.trim();
        const company = document.getElementById('company').value.trim();
        const tel = document.getElementById('tel').value.trim();
        const email = document.getElementById('email').value.trim();

        // Build URL
        // We use the current location to guess where profile.html is hosted
        let baseUrl = window.location.href.split('?')[0];
        
        // Ensure we point to profile.html
        if (baseUrl.endsWith('/index.html')) {
            baseUrl = baseUrl.replace('/index.html', '/profile.html');
        } else if (baseUrl.endsWith('/')) {
            baseUrl += 'profile.html';
        } else {
            // e.g. /my-folder -> /my-folder/profile.html
            baseUrl += '/profile.html';
        }

        // Build a shorter data payload using Base64 encoding
        const dataObj = { n: name, t: tel };
        if (company) dataObj.c = company;
        if (email) dataObj.e = email;

        // Convert obj to JSON and safely encode to Base64 (supporting UTF-8)
        const jsonStr = JSON.stringify(dataObj);
        // UTF-8 to safe Base64
        const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
        // Make URL-safe (Base64url format)
        const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        const fullUrl = `${baseUrl}?d=${safeBase64}`;

        // Display results
        generatedUrlInput.value = fullUrl;
        previewLink.href = fullUrl;
        
        resultSection.classList.remove('hidden');
        copyMsg.classList.add('hidden'); // Reset message state
        
        // Scroll to result smoothly
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    copyBtn.addEventListener('click', () => {
        generatedUrlInput.select();
        generatedUrlInput.setSelectionRange(0, 99999); /* For mobile devices */

        navigator.clipboard.writeText(generatedUrlInput.value).then(() => {
            copyMsg.classList.remove('hidden');
            setTimeout(() => {
                copyMsg.classList.add('hidden');
            }, 3000);
        }).catch(err => {
            console.error('Copy failed', err);
            alert('クリップボードへのコピーに失敗しました。手動でコピーしてください。');
        });
    });
});
