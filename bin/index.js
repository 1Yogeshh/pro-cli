#!/usr/bin/env node
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { setupReact } = require("./reactSetup");
const { setupNext } = require("./nextSetup");
const { reactNativeSetup } = require("./reactNativeSetup");

const run = async () => {
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
  ]);

  const projectPath = path.join(process.cwd(), answers.projectName);

  //react setup
  if (answers.framework === "React") await setupReact(projectPath, answers);

  //nextjs setup
  if (answers.framework === "Next.js") await setupNext(projectPath, answers);

  //react native setup
  if (answers.framework === "React Native") { await reactNativeSetup(projectPath, answers); }
};

run();
