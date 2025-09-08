const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

async function setupNext(projectPath, answers) {
  try {
    // Define file extension based on language
    const ext = answers.language === "TypeScript" ? "ts" : "js";
    const componentExt = answers.language === "TypeScript" ? "tsx" : "jsx";

    // 1️⃣ Create Next.js project with flags
    console.log("\n🚀 Creating Next.js project...");
    const langFlag =
      answers.language === "TypeScript" ? "--typescript" : "--js";
    execSync(
      `npx create-next-app@latest ${answers.projectName} ${langFlag} --eslint ${
        answers.css === "Tailwind" ? "--tailwind" : ""
      } --app --src-dir --import-alias "@/*"`,
      { stdio: "inherit" }
    );

    // 2️⃣ Folder structure
    console.log("\n✨ Creating folder structure...");
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
    if (answers.extras.includes("Redux")) {
      deps.push("@reduxjs/toolkit", "react-redux", "redux-persist");
    }
    if (answers.css === "Chakra") {
      deps.push(
        "@chakra-ui/react@2",
        "@emotion/react",
        "@emotion/styled",
        "framer-motion"
      );
    }
    if (answers.router === "React Router") {
      deps.push("react-router-dom");
    }

    if (deps.length > 0) {
      console.log("\n📦 Installing extra dependencies...");
      execSync(`npm install ${deps.join(" ")}`, {
        stdio: "inherit",
        cwd: projectPath,
      });
    }

    // 4️⃣ Shadcn Components
    if (answers.shadcn && answers.shadcn.length > 0) {
      console.log("\n✨ Setting up shadcn/ui components...");
      const compJsonPath = path.join(projectPath, "components.json");
      if (!fs.existsSync(compJsonPath)) {
        execSync(`npx shadcn@latest init -y`, {
          stdio: "inherit",
          cwd: projectPath,
        });
      }

      const componentsToAdd = answers.shadcn.map(comp => comp === "toast" ? "sonner" : comp);
      const selected = componentsToAdd.join(" ");
      execSync(`npx shadcn@latest add ${selected}`, {
        stdio: "inherit",
        cwd: projectPath,
      });
      console.log(
        `✅ Added shadcn/ui components: ${answers.shadcn.join(", ")}`
      );
    }

    // 5️⃣ Redux Setup
    if (answers.extras.includes("Redux")) {
      console.log("✨ Setting up Redux + Redux Persist...");
      const storeDir = path.join(projectPath, "src/store");

      // store/index.[ts/js]
      const storeFile = path.join(storeDir, `index.${ext}`);
      const storeContent =
        answers.language === "TypeScript"
          ? `
"use client";

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
        `.trim()
          : `
"use client";

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
export default store;
        `.trim();

      fs.writeFileSync(storeFile, storeContent, "utf-8");

      // store/authSlice.[ts/js]
      const authSliceFile = path.join(storeDir, `authSlice.${ext}`);
      const authSliceContent =
        answers.language === "TypeScript"
          ? `
"use client";

import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    setToken: (state, action) => { state.token = action.payload; },
    logout: (state) => { state.user = null; state.token = null; },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
        `.trim()
          : `
"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    setToken: (state, action) => { state.token = action.payload; },
    logout: (state) => { state.user = null; state.token = null; },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
        `.trim();

      fs.writeFileSync(authSliceFile, authSliceContent, "utf-8");

      // Update layout.[ts/js]
      const layoutPath = path.join(projectPath, "src", "app", `layout.${ext}`);
      if (fs.existsSync(layoutPath)) {
        console.log("Updating layout.js for Redux setup...");
        let layoutCode = fs.readFileSync(layoutPath, "utf-8");

        if (!layoutCode.includes('"use client";')) {
          layoutCode = `"use client";\n\n` + layoutCode;
        }

        if (!layoutCode.includes("Provider")) {
          layoutCode = layoutCode.replace(
            /import .* from .*/g,
            (match) =>
              `${match}\nimport { Provider } from 'react-redux';\nimport { PersistGate } from 'redux-persist/integration/react';\nimport store, { persistor } from '@/store';`
          );
        }

        if (!layoutCode.includes("<Provider")) {
          layoutCode = layoutCode.replace(
            /return\s*\(\s*<>\s*{children}\s*<\/>\s*\)/,
            `return (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  </Provider>
)`
          );
        }

        fs.writeFileSync(layoutPath, layoutCode, "utf-8");
        console.log("✅ Redux integrated into layout.js");
      }
    }

    // 6️⃣ Chakra setup
    if (answers.css === "Chakra") {
      console.log("\n✨ Setting up Chakra UI...");
      const layoutPath = path.join(projectPath, "src", "app", `layout.${ext}`);
      if (fs.existsSync(layoutPath)) {
        let layoutCode = fs.readFileSync(layoutPath, "utf-8");

        if (!layoutCode.includes("ChakraProvider")) {
          layoutCode = layoutCode.replace(
            /import .* from .*/g,
            (match) =>
              `${match}\nimport { ChakraProvider } from '@chakra-ui/react';`
          );
        }

        layoutCode = layoutCode.replace(
          /return\s*\(\s*<>\s*{children}\s*<\/>\s*\)/,
          `return (
  <ChakraProvider>{children}</ChakraProvider>
)`
        );

        fs.writeFileSync(layoutPath, layoutCode, "utf-8");
      }
    }

    // 7️⃣ React Router setup
    if (answers.router === "React Router") {
      console.log("\n✨ Setting up React Router...");
      const layoutPath = path.join(projectPath, "src", "app", `layout.${ext}`);
      if (fs.existsSync(layoutPath)) {
        let layoutCode = fs.readFileSync(layoutPath, "utf-8");

        if (!layoutCode.includes("BrowserRouter")) {
          layoutCode = layoutCode.replace(
            /import .* from .*/g,
            (match) =>
              `${match}\nimport { BrowserRouter } from 'react-router-dom';`
          );
        }

        layoutCode = layoutCode.replace(
          /return\s*\(\s*<>\s*{children}\s*<\/>\s*\)/,
          `return (
  <BrowserRouter>{children}</BrowserRouter>
)`
        );

        fs.writeFileSync(layoutPath, layoutCode, "utf-8");
        console.log("✅ React Router integrated into layout.js");
      }
    }

    // 8️⃣ Copy starter files
    console.log("\n📁 Copying starter files...");
    const templateDir = path.join(__dirname, "next");
    if (!fs.existsSync(templateDir)) {
      console.error("⚠️ Template directory not found:", templateDir);
      return;
    }

    if (answers.language !== "TypeScript") {
      if (answers.css === "Tailwind") {
        const templatePath = path.join(templateDir, "tailwind/page.js");
        if (fs.existsSync(templatePath)) {
          fs.copySync(
            templatePath,
            path.join(projectPath, "src", "app", `page.js`),
            {
              overwrite: true,
            }
          );
        } else {
          console.error("⚠️ Tailwind page template not found:", templatePath);
        }
      } else {
        const templatePath = path.join(templateDir, "simple/page.js");
        if (fs.existsSync(templatePath)) {
          fs.copySync(
            templatePath,
            path.join(projectPath, "src", "app", `page.js`),
            {
              overwrite: true,
            }
          );
        } else {
          console.error("⚠️ Simple page template not found:", templatePath);
        }
      }
    }

    // 9️⃣ Prebuilt Pages
    console.log("\n📁 Adding pre-built pages...");
    const prebuiltDir = path.join(__dirname, "preBuilt");
    if (!fs.existsSync(prebuiltDir)) {
      console.error("⚠️ Prebuilt directory not found:", prebuiltDir);
      return;
    }

    if (answers.prebuilt.includes("Login Page")) {
      const loginTemplate = path.join(prebuiltDir, `LoginPage.${componentExt}`);
      const destLogin = path.join(
        projectPath,
        "src",
        "app",
        "login",
        `page.${componentExt}`
      );
      fs.ensureDirSync(path.dirname(destLogin));
      if (fs.existsSync(loginTemplate)) {
        fs.copySync(loginTemplate, destLogin);
      } else {
        console.error("⚠️ LoginPage template not found:", loginTemplate);
      }
    }

    if (answers.prebuilt.includes("Register Page")) {
      const registerTemplate = path.join(
        prebuiltDir,
        `RegisterPage.${componentExt}`
      );
      const destRegister = path.join(
        projectPath,
        "src",
        "app",
        "register",
        `page.${componentExt}`
      );
      fs.ensureDirSync(path.dirname(destRegister));
      if (fs.existsSync(registerTemplate)) {
        fs.copySync(registerTemplate, destRegister);
      } else {
        console.error("⚠️ RegisterPage template not found:", registerTemplate);
      }
    }

    console.log("\n✅ Next.js project setup complete using pro-cli ✨");
    console.log(`cd ${answers.projectName} && npm run dev`);
  } catch (error) {
    console.error("❌ Error during setup:", error.message);
    process.exit(1);
  }
}

module.exports = { setupNext };
