const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "src", "super-parallax.js");
const distPath = path.join(__dirname, "dist", "super-parallax.js");

if (!fs.existsSync(path.join(__dirname, "dist"))) {
  fs.mkdirSync(path.join(__dirname, "dist"));
}

fs.copyFileSync(srcPath, distPath);

console.log("✅ Build complete!");
console.log("📦 Output: dist/super-parallax.js");
