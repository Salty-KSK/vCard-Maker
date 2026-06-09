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

        // Build the shortest possible data payload using tab-delimited string
        const clean = (str) => str.replace(/\t/g, ' '); // Prevent delimiter conflict
        const parts = [clean(name), clean(tel), clean(company), clean(email)];
        
        // Remove trailing empty fields to save space
        while (parts.length > 0 && parts[parts.length - 1] === '') {
            parts.pop();
        }
        
        const payloadStr = parts.join('\t');
        
        // UTF-8 to safe Base64
        const base64 = btoa(unescape(encodeURIComponent(payloadStr)));
        // Make URL-safe (Base64url format)
        const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        const fullUrl = `${baseUrl}?d=${safeBase64}`;

        // Show loading state
        generatedUrlInput.value = "短縮URLを生成中...";
        previewLink.href = fullUrl;
        copyBtn.disabled = true;
        copyBtn.style.opacity = '0.5';
        
        resultSection.classList.remove('hidden');
        copyMsg.classList.add('hidden'); // Reset message state
        
        // Scroll to result smoothly
        resultSection.scrollIntoView({ behavior: 'smooth' });

        // Warning for local environment
        const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let localWarning = document.getElementById('local-warning');
        if (isLocal) {
            if (!localWarning) {
                localWarning = document.createElement('div');
                localWarning.id = 'local-warning';
                localWarning.className = 'error-state';
                localWarning.style.marginTop = '15px';
                localWarning.style.padding = '10px';
                localWarning.style.fontSize = '0.85rem';
                localWarning.innerHTML = '⚠️ <strong>注意:</strong> 現在パソコンのローカル環境から実行されています。デプロイするまで短縮URLは生成されません。下のURLはスマホ等からは<strong>絶対に開けません</strong>。インターネット本番環境にデプロイしてから再生成してください。';
                resultSection.appendChild(localWarning);
            }
            
            generatedUrlInput.value = fullUrl;
            copyBtn.disabled = false;
            copyBtn.style.opacity = '1';
            return;
        } else {
            if (localWarning) localWarning.remove();
        }

        // Generate short URL using fetch (is.gd API) with timeout
        const showFullUrl = () => {
            generatedUrlInput.value = fullUrl;
            copyBtn.disabled = false;
            copyBtn.style.opacity = '1';
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト

        fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(fullUrl)}`, {
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data && data.shorturl) {
                generatedUrlInput.value = data.shorturl;
                previewLink.href = data.shorturl;
            } else {
                showFullUrl();
            }
            copyBtn.disabled = false;
            copyBtn.style.opacity = '1';
        })
        .catch(() => {
            clearTimeout(timeoutId);
            showFullUrl();
        });
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
