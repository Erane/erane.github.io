const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} 文件内容
 */
async function readFileContent(filePath) {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        console.error(`无法读取文件 ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * 处理CSS外联引用，替换为内联样式
 * @param {string} htmlContent - HTML内容
 * @param {string} baseDir - HTML文件所在目录
 * @returns {Promise<string>} 处理后的HTML内容
 */
async function inlineCss(htmlContent, baseDir) {
    // 匹配<link rel="stylesheet" href="...">标签
    const cssRegex = /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/gi;
    let result = htmlContent;
    const matches = [...htmlContent.matchAll(cssRegex)];

    for (const match of matches) {
        const fullMatch = match[0];
        const cssPath = match[1];
        const absolutePath = path.resolve(baseDir, cssPath);

        if (!existsSync(absolutePath)) {
            console.warn(`CSS文件不存在: ${absolutePath}，将保留原始引用`);
            continue;
        }

        try {
            const cssContent = await readFileContent(absolutePath);
            // 替换外联引用为内联样式
            result = result.replace(fullMatch, `<style>\n${cssContent}\n</style>`);
            console.log(`已处理CSS: ${cssPath}`);
        } catch (error) {
            console.warn(`处理CSS ${cssPath} 时出错，将保留原始引用`);
        }
    }

    return result;
}

/**
 * 处理JS外联引用，替换为内联脚本
 * @param {string} htmlContent - HTML内容
 * @param {string} baseDir - HTML文件所在目录
 * @returns {Promise<string>} 处理后的HTML内容
 */
async function inlineJs(htmlContent, baseDir) {
    // 匹配<script src="..."></script>标签
    const jsRegex = /<script\s+src="([^"]+)"\s*>(?:<\/script>)?/gi;
    let result = htmlContent;
    const matches = [...htmlContent.matchAll(jsRegex)];

    for (const match of matches) {
        const fullMatch = match[0];
        const jsPath = match[1];
        const absolutePath = path.resolve(baseDir, jsPath);

        if (!existsSync(absolutePath)) {
            console.warn(`JS文件不存在: ${absolutePath}，将保留原始引用`);
            continue;
        }

        try {
            const jsContent = await readFileContent(absolutePath);
            // 替换外联引用为内联脚本
            result = result.replace(fullMatch, `<script>\n${jsContent}\n</script>`);
            console.log(`已处理JS: ${jsPath}`);
        } catch (error) {
            console.warn(`处理JS ${jsPath} 时出错，将保留原始引用`);
        }
    }

    return result;
}

/**
 * 主函数：处理HTML文件，将外联CSS和JS转换为内联
 * @param {string} inputFile - 输入HTML文件路径
 * @param {string} outputFile - 输出HTML文件路径
 */
async function processHtml(inputFile, outputFile) {
    try {
        // 检查输入文件是否存在
        if (!existsSync(inputFile)) {
            console.error(`输入文件不存在: ${inputFile}`);
            return;
        }

        // 获取输入文件所在目录
        const baseDir = path.dirname(inputFile);

        // 读取HTML内容
        let htmlContent = await readFileContent(inputFile);
        console.log(`已读取HTML文件: ${inputFile}`);

        // 处理CSS和JS
        htmlContent = await inlineCss(htmlContent, baseDir);
        htmlContent = await inlineJs(htmlContent, baseDir);

        // 保存处理后的HTML
        await fs.writeFile(outputFile, htmlContent, 'utf8');
        console.log(`处理完成，已保存到: ${outputFile}`);
    } catch (error) {
        console.error('处理过程中发生错误:', error);
    }
}

// 默认配置
const inputFilePath = path.resolve(__dirname, 'index.html');
const outputFilePath = path.resolve(__dirname, 'index_inlined.html');

// 执行主函数
processHtml(inputFilePath, outputFilePath);
