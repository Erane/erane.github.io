const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// 读取 index.html
const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

// 内联 JS 文件
document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    if (fs.existsSync(src)) {
        const content = fs.readFileSync(src, 'utf-8');
        const inlineScript = document.createElement('script');
        inlineScript.textContent = content;
        script.replaceWith(inlineScript);
    }
});

// 内联 CSS 文件
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (fs.existsSync(href)) {
        const content = fs.readFileSync(href, 'utf-8');
        const style = document.createElement('style');
        style.textContent = content;
        link.replaceWith(style);
    }
});

// 输出新的 HTML 文件
fs.writeFileSync('dist/index_single.html', document.documentElement.outerHTML);
console.log('✅ 单文件已生成');
