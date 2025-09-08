const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

async function setupReact(projectPath, answers) {
  // 1️⃣ Create CRA
  console.log("\n🚀 Creating React project...");
  execSync(`npx create-react-app ${answers.projectName}`, {
    stdio: "inherit",
  });

  // 2️⃣ Folder structure
  console.log("\n✨ Creating folder structure...");
  const folders = [
    "src/api",
    "src/assets",
    "src/components",
    "src/hooks",
    "src/layouts",
    "src/pages",
    "src/services",
    "src/store",
    "src/styles",
    "src/utils",
    "src/tests",
    "src/config",
  ];
  folders.forEach((f) => fs.ensureDirSync(path.join(projectPath, f)));

  // 3️⃣ Prepare dependencies
  let deps = [];
  let devDeps = [];

  if (answers.css === "Tailwind") {
    devDeps.push("tailwindcss@3", "postcss", "autoprefixer");
  }
  if (answers.css === "Chakra") {
    deps.push(
      "@chakra-ui/react@2",
      "@emotion/react",
      "@emotion/styled",
      "framer-motion"
    );
  }
  if (answers.router === "React Router") deps.push("react-router-dom");
  if (answers.extras.includes("Axios")) deps.push("axios");
  if (answers.extras.includes("Toast")) deps.push("react-hot-toast");
  if (answers.extras.includes("Icons")) deps.push("lucide-react");
  if (answers.extras.includes("Formik")) deps.push("formik");
  if (answers.extras.includes("Redux")) {
    deps.push("@reduxjs/toolkit", "react-redux", "redux-persist");
  }

  // 4️⃣ Install dependencies
  console.log("\n📦 Installing extra dependencies...");
  if (deps.length > 0) {
    execSync(`npm install ${deps.join(" ")}`, {
      stdio: "inherit",
      cwd: projectPath,
    });
  }
  if (devDeps.length > 0) {
    execSync(`npm install -D ${devDeps.join(" ")}`, {
      stdio: "inherit",
      cwd: projectPath,
    });
  }

  // 5️⃣ Redux Setup
  if (answers.extras.includes("Redux")) {
    console.log("✨ Setting up Redux + Redux Persist...");
    const storeDir = path.join(projectPath, "src/store");
    fs.ensureDirSync(storeDir);

    // store/index.js
    const storeFile = path.join(storeDir, "index.js");
    fs.writeFileSync(
      storeFile,
      `
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
      `.trim(),
      "utf-8"
    );

    // store/authSlice.js
    const authSliceFile = path.join(storeDir, "authSlice.js");
    fs.writeFileSync(
      authSliceFile,
      `
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload },
    setToken: (state, action) => { state.token = action.payload },
    logout: (state) => { state.user = null; state.token = null },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
      `.trim(),
      "utf-8"
    );

    // Wrap App in Provider
    const indexJsPath = path.join(projectPath, "src/index.js");
    if (fs.existsSync(indexJsPath)) {
      let indexCode = fs.readFileSync(indexJsPath, "utf-8");
      if (!indexCode.includes("Provider")) {
        indexCode = indexCode.replace(
          "import App from './App';",
          `import App from './App';\nimport { Provider } from 'react-redux';\nimport store, { persistor } from './store';\nimport { PersistGate } from 'redux-persist/integration/react';`
        );
      }
      indexCode = indexCode.replace(
        /<App\s*\/>/,
        `<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>`
      );
      fs.writeFileSync(indexJsPath, indexCode, "utf-8");
    }
  }

  // 5️⃣ Copy starter files
  console.log("\n📁 Copying starter files...");
  if (answers.css === "Tailwind") {
    const templatePath = path.join(__dirname, "templates/react");
    if (fs.existsSync(templatePath)) {
      fs.copySync(templatePath, path.join(projectPath, "src"), {
        overwrite: true,
      });
    }
  } else {
    const templatePath = path.join(__dirname, "template/tailwind/react");
    if (fs.existsSync(templatePath)) {
      fs.copySync(templatePath, path.join(projectPath, "src"), {
        overwrite: true,
      });
    }
  }

  console.log("\n📁 Adding pre-built pages...");
  // Create components folder if not exists
  const componentsDir = path.join(projectPath, "src/components");
  fs.ensureDirSync(componentsDir);

  // Prepare styles based on Tailwind selection
  const isTailwind = answers.css === "Tailwind";

  // Input.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Input.jsx"),
    `
import React from "react";

const Input = ({ label, type = "text", value, onChange, placeholder, error }) => {
  return (
    <div ${
      isTailwind
        ? 'className="flex flex-col mb-4"'
        : 'style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}'
    }>
      {label && <label ${
        isTailwind ? 'className="mb-1 font-medium"' : ""
      }>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        ${
          isTailwind
            ? 'className="p-2 border border-gray-300 rounded"'
            : 'style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}'
        }
      />
      {error && <span ${
        isTailwind
          ? 'className="text-red-500 text-sm mt-1"'
          : 'style={{ color: "red", fontSize: "12px" }}'
      }>{error}</span>}
    </div>
  );
};

export default Input;
  `.trim(),
    "utf-8"
  );

  // Button.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Button.jsx"),
    `
import React from "react";

const Button = ({ children, onClick, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      ${
        isTailwind
          ? 'className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"'
          : `style={{
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}`
      }
    >
      {children}
    </button>
  );
};

export default Button;
  `.trim(),
    "utf-8"
  );

  // Card.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Card.jsx"),
    `
import React from "react";

const Card = ({ children }) => {
  return (
    <div ${
      isTailwind
        ? 'className="p-4 border border-gray-200 rounded shadow-sm"'
        : 'style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}'
    }>
      {children}
    </div>
  );
};

export default Card;
  `.trim(),
    "utf-8"
  );

  // Avatar.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Avatar.jsx"),
    `
import React from "react";

const Avatar = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      ${
        isTailwind
          ? 'className="w-12 h-12 rounded-full border border-gray-300"'
          : 'style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid #ccc" }}'
      }
    />
  );
};

export default Avatar;
  `.trim(),
    "utf-8"
  );

  // Dialog.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Dialog.jsx"),
    `
import React from "react";

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div ${
      isTailwind
        ? 'className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"'
        : 'style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}'
    }>
      <div ${
        isTailwind
          ? 'className="bg-white p-4 rounded shadow-lg"'
          : 'style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}'
      }>
        {children}
        <button ${
          isTailwind
            ? 'className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"'
            : 'style={{ marginTop: "10px", padding: "10px", backgroundColor: "#ff4d4f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}'
        } onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Dialog;
  `.trim(),
    "utf-8"
  );

  // DropdownMenu.jsx
  fs.writeFileSync(
    path.join(componentsDir, "DropdownMenu.jsx"),
    `
import React, { useState } from "react";

const DropdownMenu = ({ label, options }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div ${
      isTailwind
        ? 'className="relative inline-block text-left"'
        : 'style={{ position: "relative", display: "inline-block", textAlign: "left" }}'
    }>
      <button ${
        isTailwind
          ? 'className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"'
          : 'style={{ padding: "10px", backgroundColor: "#eee", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}'
      } onClick={() => setOpen(!open)}>
        {label}
      </button>
      {open && (
        <ul ${
          isTailwind
            ? 'className="absolute mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg"'
            : 'style={{ position: "absolute", marginTop: "8px", width: "160px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}'
        }>
          {options.map((opt, idx) => (
            <li key={idx} ${
              isTailwind
                ? 'className="px-4 py-2 hover:bg-gray-100 cursor-pointer"'
                : 'style={{ padding: "10px", cursor: "pointer" }}'
            } onClick={() => { setSelected(opt); setOpen(false); }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
  `.trim(),
    "utf-8"
  );

  // Checkbox.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Checkbox.jsx"),
    `
import React from "react";

const Checkbox = ({ label, checked, onChange }) => {
  return (
    <label ${
      isTailwind
        ? 'className="flex items-center space-x-2"'
        : 'style={{ display: "flex", alignItems: "center", gap: "8px" }}'
    }>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        ${
          isTailwind
            ? 'className="h-4 w-4 text-blue-600 border-gray-300 rounded"'
            : 'style={{ width: "16px", height: "16px" }}'
        }
      />
      <span>${isTailwind ? "" : ""}{label}</span>
    </label>
  );
};

export default Checkbox;
  `.trim(),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(componentsDir, "Switch.jsx"),
    `
import React from "react";

const Switch = ({ checked, onChange }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      ${
        isTailwind
          ? 'className={`${checked ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}'
          : 'style={{ width: "44px", height: "24px", backgroundColor: checked ? "#007bff" : "#ccc", borderRadius: "9999px", position: "relative", cursor: "pointer", transition: "background-color 0.2s" }}'
      }
    >
      <span
        ${
          isTailwind
            ? 'className={`${checked ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}'
            : 'style={{ width: "16px", height: "16px", backgroundColor: "#fff", borderRadius: "9999px", position: "absolute", top: "4px", left: checked ? "24px" : "4px", transition: "left 0.2s" }}'
        }
      ></span>
    </button>
  );
};

export default Switch;
  `.trim(),
    "utf-8"
  );

  // Form.jsx
  fs.writeFileSync(
    path.join(componentsDir, "Form.jsx"),
    `
import React from "react";

const Form = ({ onSubmit, children }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      ${
        isTailwind
          ? 'className="space-y-4"'
          : 'style={{ display: "flex", flexDirection: "column", gap: "16px" }}'
      }
    >
      {children}
    </form>
  );
};

export default Form;
  `.trim(),
    "utf-8"
  );

  // Sonner.jsx (toast replacement)
  fs.writeFileSync(
    path.join(componentsDir, "Sonner.jsx"),
    `
import React from "react";

const Sonner = ({ message }) => {
  return (
    <div ${
      isTailwind
        ? 'className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded shadow-lg"'
        : 'style={{ position: "fixed", bottom: "16px", right: "16px", padding: "12px", backgroundColor: "#28a745", color: "#fff", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}'
    }>
      {message}
    </div>
  );
};

export default Sonner;
  `.trim(),
    "utf-8"
  );

  if (answers.prebuilt.includes("Login Page")) {
    const loginTemplate = path.join(__dirname, "preBuilt/LoginPage.jsx");
    const destLogin = path.join(projectPath, "src/pages/Login.jsx");
    fs.ensureDirSync(path.dirname(destLogin));
    if (fs.existsSync(loginTemplate)) {
      fs.copySync(loginTemplate, destLogin);
    }
  }
  if (answers.prebuilt.includes("Register Page")) {
    const registerTemplate = path.join(__dirname, "preBuilt/RegisterPage.jsx");
    const destRegister = path.join(projectPath, "src/pages/Register.jsx");
    fs.ensureDirSync(path.dirname(destRegister));
    if (fs.existsSync(registerTemplate)) {
      fs.copySync(registerTemplate, destRegister);
    }
  }
  // 6️⃣ React Router setup if selected
  if (answers.router === "React Router") {
    console.log("🔧 Setting up React Router...");

    // Update App.js with Login/Register routes if needed
    const appJsPath = path.join(projectPath, "src", "App.js");
    if (fs.existsSync(appJsPath)) {
      let appCode = `
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
${
  answers.prebuilt.includes("Login Page")
    ? 'import Login from "./pages/Login";'
    : ""
}
${
  answers.prebuilt.includes("Register Page")
    ? 'import Register from "./pages/Register";'
    : ""
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        ${
          answers.prebuilt.includes("Login Page")
            ? "<Route path='/login' element={<Login />} />"
            : ""
        }
        ${
          answers.prebuilt.includes("Register Page")
            ? "<Route path='/register' element={<Register />} />"
            : ""
        }
      </Routes>
    </Router>
  );
}

export default App;
    `.trim();
      fs.writeFileSync(appJsPath, appCode, "utf-8");
    }

    // Define pages once
    let pages = {
      "Home.jsx": `import React from "react";
import { Link } from "react-router-dom";
${answers.css !== "Tailwind" ? 'import "../styles/Home.css";' : ""}

const Home = () => {
  return (
    <div className="${
      answers.css === "Tailwind"
        ? "bg-gradient-to-br from-black via-gray-900 to-black min-h-screen flex flex-col"
        : "home-container"
    }">
      {/* Top Navigation */}
      <nav className="${
        answers.css === "Tailwind"
          ? "w-full flex justify-end gap-6 p-6 text-white"
          : "nav-container"
      }">
        <Link to="/about" className="${
          answers.css === "Tailwind"
            ? "hover:text-blue-400 transition"
            : "nav-link"
        }">About</Link>
        <Link to="/contact" className="${
          answers.css === "Tailwind"
            ? "hover:text-blue-400 transition"
            : "nav-link"
        }">Contact</Link>
        <Link to="/" className="${
          answers.css === "Tailwind"
            ? "hover:text-blue-400 transition"
            : "nav-link"
        }">Home</Link>
      </nav>

      {/* Main Content */}
      <div className="${
        answers.css === "Tailwind"
          ? "flex-grow flex flex-col justify-center items-center gap-8 px-6"
          : "main-content"
      }">
        {/* Animated Loading Indicator */}
        <div className="${
          answers.css === "Tailwind"
            ? "relative h-4 w-4 flex items-center justify-center"
            : "loading-indicator"
        }">
          <div className="${
            answers.css === "Tailwind"
              ? "absolute h-4 w-4 bg-green-300 rounded-full animate-ping"
              : "ping-dot"
          }"></div>
          <div className="${
            answers.css === "Tailwind"
              ? "h-4 w-4 bg-blue-500 rounded-full animate-spin absolute"
              : "spin-dot"
          }"></div>
        </div>

        {/* Text Section */}
        <div className="${
          answers.css === "Tailwind"
            ? "text-center max-w-4xl space-y-6"
            : "text-section"
        }">
          <h1 className="${
            answers.css === "Tailwind"
              ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-100 text-6xl md:text-7xl font-bold leading-tight"
              : "main-title"
          }">
            Welcome to the Future
          </h1>

          <h2 className="${
            answers.css === "Tailwind"
              ? "text-gray-400 text-2xl md:text-3xl font-semibold"
              : "subtitle"
          }">
            React App powered by Pro-CLI ✨
          </h2>

          <p className="${
            answers.css === "Tailwind"
              ? "text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
              : "description"
          }">
            Experience the next generation of web development with our
            cutting-edge React application. Built with modern tools, designed
            for performance, and crafted for an exceptional user experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

    `.trim(),

      "About.jsx": `import React from "react";
${answers.css !== "Tailwind" ? 'import "../styles/About.css";' : ""}
const About = () => {
  return <div className="${
    answers.css === "Tailwind"
      ? "h-screen w-full flex justify-center items-center"
      : "about-container"
  }">
    <h1 className="${
      answers.css === "Tailwind" ? "text-center text-2xl" : "about-title"
    }">About Page</h1>
  </div>;
};
export default About;`.trim(),

      "Contact.jsx": `import React from "react";
${answers.css !== "Tailwind" ? 'import "../styles/Contact.css";' : ""}
const Contact = () => {
  return <div className="${
    answers.css === "Tailwind"
      ? "h-screen w-full flex justify-center items-center"
      : "contact-container"
  }">
    <h1 className="${
      answers.css === "Tailwind" ? "text-center text-2xl" : "contact-title"
    }">Contact Page</h1>
  </div>;
};
export default Contact;`.trim(),
    };

    // Write pages to src/pages
    Object.entries(pages).forEach(([fileName, content]) => {
      const filePath = path.join(projectPath, "src/pages", fileName);
      fs.writeFileSync(filePath, content, "utf-8");
    });

    // Generate CSS files if Tailwind is NOT selected
    if (answers.css !== "Tailwind") {
      const stylesDir = path.join(projectPath, "src/styles");
      fs.ensureDirSync(stylesDir);

      const cssFiles = {
        "Home.css": `.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom right, #000, #1a1a1a, #000);
}

.nav-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 1.5rem;
  color: white;
}

.nav-link:hover {
  color: #3b82f6; /* blue-400 */
  transition: color 0.3s;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 0 1.5rem;
}

.loading-indicator {
  position: relative;
  height: 1rem;
  width: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ping-dot {
  position: absolute;
  height: 1rem;
  width: 1rem;
  background-color: #86efac; /* green-300 */
  border-radius: 9999px;
  animation: ping 1s infinite;
}

.spin-dot {
  position: absolute;
  height: 1rem;
  width: 1rem;
  background-color: #3b82f6; /* blue-500 */
  border-radius: 9999px;
  animation: spin 1s linear infinite;
}

.text-section {
  text-align: center;
  max-width: 64rem;
}

.main-title {
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #fff, #d4d4d8, #f5f5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #9ca3af;
  font-size: 1.5rem;
  font-weight: 600;
}

.description {
  color: #6b7280;
  font-size: 1.125rem;
  line-height: 1.75rem;
  max-width: 42rem;
  margin: 0 auto;
}

/* Animations */
@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(2); opacity: 0; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

      `.trim(),
        "About.css": `
.about-container { height: 100vh; width: 100%; display: flex; justify-content: center; align-items: center; }
.about-title { text-align: center; font-size: 2rem; font-weight: bold; }
      `.trim(),
        "Contact.css": `
.contact-container { height: 100vh; width: 100%; display: flex; justify-content: center; align-items: center; }
.contact-title { text-align: center; font-size: 2rem; font-weight: bold; }
      `.trim(),
      };
      Object.entries(cssFiles).forEach(([fileName, content]) => {
        fs.writeFileSync(path.join(stylesDir, fileName), content, "utf-8");
      });

      console.log("✅ Basic CSS files created in src/styles");
    }

    console.log(
      "✅ React Router with Home, About, and Contact pages configured."
    );
  }

  // 7️⃣ Tailwind setup
  if (answers.css === "Tailwind") {
    console.log("📦 Installing Tailwind dependencies...");
    execSync(
      `cd ${projectPath} && npm install -D tailwindcss@3 postcss autoprefixer`,
      { stdio: "inherit" }
    );

    console.log("📝 Creating Tailwind & PostCSS configs...");
    fs.writeFileSync(
      path.join(projectPath, "tailwind.config.js"),
      `
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
      `.trim()
    );

    fs.writeFileSync(
      path.join(projectPath, "postcss.config.js"),
      `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
      `.trim()
    );

    console.log("🎨 Updating index.css...");
    fs.writeFileSync(
      path.join(projectPath, "src/index.css"),
      `
@tailwind base;
@tailwind components;
@tailwind utilities;
      `.trim()
    );
  }

  // 8️⃣ Chakra setup
  if (answers.css === "Chakra") {
    const indexJsPath = path.join(projectPath, "src/index.js");
    if (fs.existsSync(indexJsPath)) {
      let indexCode = fs.readFileSync(indexJsPath, "utf-8");
      if (!indexCode.includes("ChakraProvider")) {
        indexCode = indexCode.replace(
          "import App from './App';",
          `import App from './App';\nimport { ChakraProvider } from "@chakra-ui/react";`
        );
      }
      indexCode = indexCode.replace(
        /<App\s*\/>/,
        `<ChakraProvider>\n    <App />\n  </ChakraProvider>`
      );
      fs.writeFileSync(indexJsPath, indexCode, "utf-8");
    }
  }

  console.log("\n✅ React JS project setup complete using pro-cli ✨");
  console.log(`cd ${answers.projectName} && npm start`);
}

module.exports = { setupReact };
