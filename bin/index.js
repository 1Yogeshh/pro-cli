#!/usr/bin/env node
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { setupReact } = require("./reactSetup");
const { setupNext } = require("./nextSetup");
const { reactNativeSetup } = require("./reactNativeSetup");
const { generateAIComponent } = require("./aiAgent"); // AI agent function

const run = async () => {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "framework",
        message: "Choose framework:",
        choices: ["React", "Next.js", "React Native"],
      },
      { type: "input", name: "projectName", message: "Enter project name:" },
      {
        type: "list",
        name: "language",
        message: "Choose language:",
        choices: ["JavaScript", "TypeScript"],
        when: (answers) => answers.framework === "Next.js",
      },
      {
        type: "list",
        name: "css",
        message: "Choose CSS framework:",
        choices: ["Tailwind", "Chakra", "None"],
        when: (answers) => answers.framework !== "React Native",
      },
      {
        type: "list",
        name: "router",
        message: "Routing framework:",
        choices: ["React Router", "None"],
        when: (answers) => answers.framework === "React",
      },
      {
        type: "checkbox",
        name: "extras",
        message: "Optional packages:",
        choices: ["Axios", "Toast", "Icons", "Formik", "Redux"],
      },
      {
        type: "checkbox",
        name: "prebuilt",
        message: "Pre-built Pages:",
        choices: ["Login Page", "Register Page"],
        when: (answers) => answers.framework !== "React Native",
      },
      {
        type: "checkbox",
        name: "shadcn",
        message: "Pre-built Shadcn UI components:",
        choices: [
          "button",
          "input",
          "card",
          "avatar",
          "dialog",
          "dropdown-menu",
          "checkbox",
          "switch",
          "form",
          "toast",
        ],
        when: (answers) => answers.framework === "Next.js",
      },
      {
        type: "input",
        name: "customComponent",
        message:
          "Enter the name or functionality of the component you want AI to create (leave empty if none):",
      },
    ]);

    const projectPath = path.join(process.cwd(), answers.projectName);

    // Setup based on framework
    if (answers.framework === "React") await setupReact(projectPath, answers);
    if (answers.framework === "Next.js") await setupNext(projectPath, answers);
    if (answers.framework === "React Native")
      await reactNativeSetup(projectPath, answers);

    // Generate AI component if user input exists
    if (answers.customComponent && answers.customComponent.trim() !== "") {
      console.log("Generating components using AI...");

      // Split input by comma and trim spaces
      const components = answers.customComponent
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const componentsDir = path.join(projectPath, "src", "components");
      await fs.ensureDir(componentsDir);

      for (const componentName of components) {
        const componentCode = await generateAIComponent(
          answers.framework,
          answers.language || "JavaScript",
          componentName
        );

        const fileName =
          componentName.replace(/\s+/g, "") +
          (answers.language === "TypeScript" ? ".tsx" : ".jsx");
        const filePath = path.join(componentsDir, fileName);

        await fs.writeFile(filePath, componentCode);
        console.log(
          `AI-generated component ${componentName} saved to ${filePath}`
        );
      }
    }
  } catch (error) {
    console.error("❌ An error occurred:", error.message);
  }
};

run();
