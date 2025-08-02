async function checkNetworkAddress() {

    return new Promise((resolve, reject) => {
        function bypassSecurityCheck() {
            const modalElement = document.getElementById('security-notice');
            if (modalElement) {
                modalElement.style.display = 'none';
            }
            resolve();
        }

        window.__bypassCheck__ = bypassSecurityCheck;

        const warningTemplate = `
            <div id="security-notice" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000000cc; z-index:9999; color:#fff; text-align:center; padding-top:20vh">
              <div style="max-width:600px; margin:0 auto">
                <h2>安全验证提醒</h2>
                <p>当前访问地址未通过官方安全校验</p>
                <p style="color:#ff9e9e">非授权站点可能存在隐私泄露风险</p>
                <p>建议通过以下链接进行安全访问：</p>
                <p style="font-size:1.2em; letter-spacing:1px">https://erane.github.io/</p>
                <p>或前往DC原贴</p>
                <p>https://discord.com/channels/1291925535324110879/1383404976352661625</p>
                <button onclick="window.location.href='https://erane.github.io/'" 
                        style="background:#4CAF50; color:white; border:none; padding:12px 30px; font-size:16px; border-radius:4px; margin:20px; cursor:pointer">
                  前往官方站点
                </button>
                <p style="font-size:0.8em; opacity:0.7">如确认继续访问，请<a href="#" onclick="window.__bypassCheck__(); return false;" style="color:#4fc3f7">点击此处</a></p>
              </div>
            </div>
        `;

        const parser = new DOMParser();
        const doc = parser.parseFromString(warningTemplate, 'text/html');
        const modalDiv = doc.getElementById('security-notice');
        if (modalDiv) {
            document.body.appendChild(modalDiv);
        }
    });
}
checkNetworkAddress()