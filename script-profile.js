document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profile-container');
    const params = new URLSearchParams(window.location.search);
    
    let name = '', company = '', tel = '', email = '';
    const d = params.get('d');

    if (d) {
        try {
            // Restore from URL-safe Base64
            let base64 = d.replace(/-/g, '+').replace(/_/g, '/');
            // Pad context with = if necessary
            const padLengths = { 0:0, 1:3, 2:2, 3:1 };
            base64 += '='.repeat(padLengths[base64.length % 4] || 0);

            // Decode from UTF-8 Safe Base64
            const decodedStr = decodeURIComponent(escape(atob(base64)));
            
            if (decodedStr.startsWith('{')) {
                // Fallback for older JSON-based links
                const obj = JSON.parse(decodedStr);
                
                name = obj.n || '';
                company = obj.c || '';
                tel = obj.t || '';
                email = obj.e || '';
            } else {
                // Parse new tab-delimited format: name | tel | company | email
                const parts = decodedStr.split('\t');
                name = parts[0] || '';
                tel = parts[1] || '';
                company = parts[2] || '';
                email = parts[3] || '';
            }
        } catch (e) {
            console.error('Failed to parse profile data:', e);
        }
    } else {
        // Fallback for older links
        name = params.get('name') || '';
        company = params.get('company') || '';
        tel = params.get('tel') || '';
        email = params.get('email') || '';
    }

    // Validate minimum required fields
    if (!name || (!tel && !email)) {
        profileContainer.innerHTML = `
            <div class="error-state">
                <h2>無効なリンクです</h2>
                <p>十分な連絡先情報が提供されていません。</p>
            </div>
        `;
        return;
    }

    // Render Profile View
    const getInitial = (nameStr) => {
        return nameStr.charAt(0).toUpperCase();
    };

    let infoHtml = '';
    
    if (tel) {
        infoHtml += `
            <div class="info-item">
                <div class="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="square" stroke-linejoin="miter"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div class="info-value"><a href="tel:${tel}">${tel}</a></div>
            </div>
        `;
    }
    
    if (email) {
        infoHtml += `
            <div class="info-item">
                <div class="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="square" stroke-linejoin="miter"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div class="info-value"><a href="mailto:${email}">${email}</a></div>
            </div>
        `;
    }

    if (company) {
        infoHtml += `
            <div class="info-item">
                <div class="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="square" stroke-linejoin="miter"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><polygon points="12 14 12 14 12 14 12 14"></polygon><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="18" x2="16" y2="18"></line></svg>
                </div>
                <div class="info-value"><span>${escapeHTML(company)}</span></div>
            </div>
        `;
    }

    profileContainer.innerHTML = `
        <div class="card glass">
            <div class="profile-avatar">${getInitial(name)}</div>
            <h1 class="profile-name">${escapeHTML(name)}</h1>
            ${company ? `<p class="profile-company">${escapeHTML(company)}</p>` : ''}
            
            <div class="info-list">
                ${infoHtml}
            </div>

            <button id="download-vcard" class="btn submit-btn">
                連絡先を端末に追加する
            </button>
        </div>
    `;

    // VCard Download Logic
    document.getElementById('download-vcard').addEventListener('click', () => {
        const vcardData = generateVCard(name, company, tel, email);
        downloadVCard(vcardData, `${name}の連絡先.vcf`);
    });
});

// Helper: Escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Generate VCard V3.0 String
function generateVCard(name, company, tel, email) {
    // Basic mapping format
    let vcard = `BEGIN:VCARD\r
VERSION:3.0\r
FN:${name}\r
`;
    
    if (company) {
        vcard += `ORG:${company}\r\n`;
    }
    
    if (tel) {
        vcard += `TEL;TYPE=CELL,VOICE:${tel}\r\n`;
    }
    
    if (email) {
        vcard += `EMAIL;TYPE=WORK,INTERNET:${email}\r\n`;
    }

    vcard += `END:VCARD\r\n`;
    return vcard;
}

// Download function
function downloadVCard(vcardStr, filename) {
    // Create blob with UTF-8 encoding
    const blob = new Blob([vcardStr], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
