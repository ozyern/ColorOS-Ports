// Advanced client-side downloader with mirror speed testing
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('idmForm');
  const urlIn = document.getElementById('fileUrl');
  const nameIn = document.getElementById('fileName');
  const status = document.getElementById('status');
  const openBtn = document.getElementById('openBtn');

  // Prefill from query params (used by roms links)
  try{
    const p = new URLSearchParams(location.search);
    if(p.get('url')) urlIn.value = decodeURIComponent(p.get('url'));
    if(p.get('name')) nameIn.value = decodeURIComponent(p.get('name'));
    
    // Auto-start download if URL is provided
    if(p.get('url') && form){
      setTimeout(() => {
        form.dispatchEvent(new Event('submit'));
      }, 500);
    }
  }catch(e){}

  if(openBtn){
    openBtn.addEventListener('click', ()=>{
      if(!urlIn.value) return;
      window.open(urlIn.value, '_blank');
    });
  }

  if(form){
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const fileUrl = urlIn.value.trim();
      if(!fileUrl){ status.textContent = 'Please provide a URL.'; return; }
      
      // Only allow downloads from SourceForge (coloxy project specifically)
      const allowedDomain = 'sourceforge.net';
      try{
        const urlObj = new URL(fileUrl);
        if(!urlObj.hostname.includes('sourceforge.net') || !urlObj.pathname.includes('coloxy')){
          status.textContent = 'Error: Downloads are only allowed from https://sourceforge.net/projects/coloxy';
          status.style.color = '#ff6fa3';
          return;
        }
      }catch(err){
        status.textContent = 'Error: Invalid URL';
        status.style.color = '#ff6fa3';
        return;
      }
      
      const filename = nameIn.value.trim() || fileUrl.split('/').pop() || 'download.bin';
      
      // Test SourceForge mirrors and download from fastest
      await downloadWithMirrorTesting(fileUrl, filename, status);
    });
  }
});

// Test multiple SourceForge mirrors and download from the fastest
async function downloadWithMirrorTesting(fileUrl, filename, statusEl) {
  statusEl.textContent = 'Testing SourceForge mirrors for fastest speed...';
  statusEl.style.color = '#ff6fa3';

  try {
    // Common SourceForge mirrors
    const mirrors = [
      'https://downloads.sourceforge.net',
      'https://cfhcable.dl.sourceforge.net',
      'https://deac-riga.dl.sourceforge.net',
      'https://iweb.dl.sourceforge.net',
      'https://phoenixnap.dl.sourceforge.net',
      'https://versaweb.dl.sourceforge.net',
      'https://managedway.dl.sourceforge.net'
    ];

    // Extract the path after sourceforge.net
    const urlObj = new URL(fileUrl);
    const path = urlObj.pathname;

    // Test each mirror by timing a HEAD request (no download needed)
    statusEl.textContent = `Testing ${mirrors.length} mirrors...`;
    const results = [];
    const testSize = 2 * 1024 * 1024; // 2MB for partial test

    for (let i = 0; i < mirrors.length; i++) {
      const mirror = mirrors[i];
      const testUrl = mirror + path;
      const mirrorName = mirror.split('//')[1].split('.')[0];
      
      statusEl.textContent = `Testing mirror ${i + 1}/${mirrors.length}: ${mirrorName}...`;
      
      try {
        const startTime = performance.now();
        
        // Use image loading trick to test speed (no CORS issues)
        const speedTest = await new Promise((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => {
            reject(new Error('timeout'));
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeout);
            const endTime = performance.now();
            resolve(endTime - startTime);
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('failed'));
          };
          
          // Add timestamp to prevent caching
          img.src = testUrl + '?t=' + Date.now();
        });
        
        const duration = speedTest;
        // Lower duration = faster mirror
        results.push({ mirror, testUrl, duration, mirrorName });
        console.log(`Mirror ${mirrorName}: ${duration.toFixed(0)}ms`);
      } catch (err) {
        console.warn(`Mirror ${mirrorName} failed:`, err.message);
      }
    }

    if (results.length === 0) {
      // Fallback to original URL
      statusEl.textContent = 'Mirror testing failed. Opening original URL...';
      statusEl.style.color = '#ff6fa3';
      setTimeout(() => window.open(fileUrl, '_blank'), 1000);
      return;
    }

    // Sort by duration (fastest first)
    results.sort((a, b) => a.duration - b.duration);
    const fastest = results[0];

    statusEl.textContent = `Fastest mirror: ${fastest.mirrorName} (${fastest.duration.toFixed(0)}ms). Starting download...`;
    statusEl.style.color = '#4ade80';

    // Download from fastest mirror by opening in new tab
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = fastest.testUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      statusEl.textContent = `Downloading from ${fastest.mirrorName} (fastest mirror - ${fastest.duration.toFixed(0)}ms)`;
      statusEl.style.color = '#4ade80';
    }, 800);

  } catch(err) {
    console.error(err);
    statusEl.textContent = 'Error: ' + err.message + '. Opening original URL...';
    statusEl.style.color = '#ff6fa3';
    setTimeout(() => window.open(fileUrl, '_blank'), 1000);
  }
}

// Global helper so device pages can trigger IDM-styled downloads directly
window.startIDMDownload = function (fileUrl, suggestedName) {
  if (!fileUrl) return;

  const allowedDomain = 'sourceforge.net';
  try {
    const urlObj = new URL(fileUrl);
    if (!urlObj.hostname.includes(allowedDomain) || !urlObj.pathname.includes('coloxy')) {
      alert('Downloads are only allowed from https://sourceforge.net/projects/coloxy');
      return;
    }
  } catch (err) {
    alert('Invalid download URL');
    return;
  }

  // Prefer the provided filename, else derive from URL
  const filename = suggestedName || decodeURIComponent(fileUrl.split('/').pop() || 'download.bin');

  // Redirect to IDM page with URL and filename as query params
  window.location.href = `idm.html?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(filename)}`;
};
