const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");


async function setupNext(projectPath, answers) {
  // 1️⃣ Create Next.js project with flags
  console.log("\n🚀 Creating Next.js project...");
  // Language flag
  const langFlag = answers.language === "TypeScript" ? "--typescript" : "--js";

  execSync(
    `npx create-next-app@latest ${answers.projectName} ${langFlag} --eslint ${
      answers.css === "Tailwind" ? "--tailwind" : ""
    } --app --src-dir --import-alias "@/*"`,
    { stdio: "inherit" }
  );

  // 2️⃣ Folder structure
  console.log("\n✨ Creating folder structure...");
  // const folders = ["components", "hooks", "store", "utils", "assets"];
  // folders.forEach((f) => fs.ensureDirSync(path.join(projectPath, "src", f)));

  const folders = [
    "src/components",
    "src/features/auth/components",
    "src/features/auth/hooks",
    "src/features/auth/services",
    "src/features/auth/store",
    "src/hooks",
    "src/lib",
    "src/store",
    "src/utils",
    "src/styles",
  ];
  folders.forEach((f) => fs.ensureDirSync(path.join(projectPath, f)));

  // 3️⃣ Extra dependencies
  let deps = [];
  if (answers.extras.includes("Axios")) deps.push("axios");
  if (answers.extras.includes("Toast")) deps.push("react-hot-toast");
  if (answers.extras.includes("Icons")) deps.push("lucide-react");
  if (answers.extras.includes("Formik")) deps.push("formik");
  if (answers.css === "Chakra") {
    deps.push(
      "@chakra-ui/react@2",
      "@emotion/react",
      "@emotion/styled",
      "framer-motion"
    );
  }

  if (deps.length > 0) {
    console.log("\n📦 Installing extra dependencies...");
    execSync(`npm install ${deps.join(" ")}`, {
      stdio: "inherit",
      cwd: projectPath,
    });
  }

  // Step 7️⃣ Shadcn Components
  if (answers.shadcn && answers.shadcn.length > 0) {
    console.log("\n✨ Setting up shadcn/ui components...");

    // If components.json does not exist, init shadcn first
    const compJsonPath = path.join(projectPath, "components.json");
    if (!fs.existsSync(compJsonPath)) {
      execSync(`npx shadcn@latest init -y`, {
        stdio: "inherit",
        cwd: projectPath,
      });
    }

    // Install selected components
    const selected = answers.shadcn.join(" ");
    execSync(`npx shadcn@latest add ${selected}`, {
      stdio: "inherit",
      cwd: projectPath,
    });

    console.log(`✅ Added shadcn/ui components: ${answers.shadcn.join(", ")}`);
  }

  //   // 4️⃣ Tailwind setup fix (App Router vs Pages Router)
  //   if (answers.css === "Tailwind") {
  //     console.log("\n🎨 Setting up Tailwind CSS...");
  //     const appCssPath = path.join(projectPath,"src", "app", "globals.css");
  //     const stylesCssPath = path.join(projectPath, "styles", "globals.css");

  //     let cssPath = fs.existsSync(appCssPath) ? appCssPath : stylesCssPath;

  //     if (fs.existsSync(cssPath)) {
  //       fs.writeFileSync(
  //         cssPath,
  //         `
  // @tailwind base;
  // @tailwind components;
  // @tailwind utilities;
  //         `.trim()
  //       );
  //     }
  //   }

  // 5️⃣ Chakra setup (App wrapped with ChakraProvider)
  if (answers.css === "Chakra") {
    console.log("\n✨ Setting up Chakra UI...");
    const layoutPath = path.join(projectPath, "src", "app", "layout.js");
    if (fs.existsSync(layoutPath)) {
      let layoutCode = fs.readFileSync(layoutPath, "utf-8");

      if (!layoutCode.includes("ChakraProvider")) {
        layoutCode = layoutCode.replace(
          "export default function RootLayout({ children }) {",
          `import { ChakraProvider } from "@chakra-ui/react";\n\nexport default function RootLayout({ children }) {`
        );
      }

      layoutCode = layoutCode.replace(
        "{children}",
        `<ChakraProvider>{children}</ChakraProvider>`
      );

      fs.writeFileSync(layoutPath, layoutCode, "utf-8");
    }
  }

  console.log("\n📁 Copying starter files...");
  if (answers.css === "Tailwind") {
    const templatePath = path.join(__dirname, "next/tailwind/page.js");
    if (fs.existsSync(templatePath)) {
      fs.copySync(
        templatePath,
        path.join(projectPath, "src", "app", "page.js"),
        {
          overwrite: true,
        }
      );
    }
  } else {
    const templatePath = path.join(__dirname, "next/simple/page.js");
    if (fs.existsSync(templatePath)) {
      fs.copySync(
        templatePath,
        path.join(projectPath, "src", "app", "page.js"),
        {
          overwrite: true,
        }
      );
    }
  }

  // 6️⃣ Prebuilt Pages (Login, Register)
  console.log("\n📁 Adding pre-built pages...");
  if (answers.prebuilt.includes("Login Page")) {
    const loginTemplate = path.join(__dirname, "preBuilt/LoginPage.jsx");
    const destLogin = path.join(projectPath, "app", "login", "page.jsx");
    fs.ensureDirSync(path.dirname(destLogin));
    if (fs.existsSync(loginTemplate)) fs.copySync(loginTemplate, destLogin);
  }

  if (answers.prebuilt.includes("Register Page")) {
    const registerTemplate = path.join(__dirname, "preBuilt/RegisterPage.jsx");
    const destRegister = path.join(projectPath, "app", "register", "page.jsx");
    fs.ensureDirSync(path.dirname(destRegister));
    if (fs.existsSync(registerTemplate))
      fs.copySync(registerTemplate, destRegister);
  }

  console.log("\n✅ Next.js project setup complete using pro-cli ✨");
  console.log(`cd ${answers.projectName} && npm run dev`);
}

module.exports = { setupNext };