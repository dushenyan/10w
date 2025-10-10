import { fs } from "node:fs";
import { path } from "node:path";

// 配置参数
const config = {
  distDir: path.join(__dirname, "../dist"),
  repoName: process.env.REPO_NAME || "10w", // 与 ci.yml 中的 REPO_NAME 一致
  baseUrl: process.env.BASE_URL || `/${process.env.REPO_NAME || "10w"}/`,
  pagesDir: "pages", // 与您的页面目录一致
};

// 主处理函数
function fixHtmlPaths() {
  console.log(`开始修复路径，基础URL: ${config.baseUrl}`);

  // 1. 处理所有HTML文件
  processAllHtmlFiles(config.distDir);

  // 2. 处理404.html
  process404Page();

  console.log("路径修复完成！");
}

// 处理所有HTML文件
function processAllHtmlFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processAllHtmlFiles(fullPath);
    } else if (path.extname(file) === ".html") {
      fixSingleHtmlFile(fullPath);
    }
  });
}

// 修复单个HTML文件
function fixSingleHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(config.distDir, path.dirname(filePath));

  // 替换资源路径
  content = content.replace(
    /(href|src)=["']([^"']*)["']/g,
    (match, attr, value) => {
      // 跳过绝对路径和特殊路径
      if (
        value.startsWith("http") ||
        value.startsWith("data:") ||
        value.startsWith("#")
      ) {
        return match;
      }

      // 处理根路径
      if (value.startsWith("/")) {
        return `${attr}="${config.baseUrl}${value.substring(1)}"`;
      }

      // 处理相对路径
      const newPath = path.posix
        .join(config.baseUrl, relativePath, value)
        .replace(/\\/g, "/");

      return `${attr}="${newPath}"`;
    }
  );

  // 确保有正确的 base tag
  if (!content.includes("<base href")) {
    content = content.replace(
      "<head>",
      `<head>\n    <base href="${config.baseUrl}">`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`已修复: ${filePath}`);
}

// 处理404页面
function process404Page() {
  const filePath = path.join(config.distDir, "404.html");
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/<%= repoName %>/g, config.repoName);
    fs.writeFileSync(filePath, content, "utf8");
    console.log("已更新404页面");
  }
}

// 执行修复
fixHtmlPaths();
