# Pro CLI – React / React Native / Next.js Project Setup CLI

**Pro CLI** is a powerful command-line tool designed to help developers quickly bootstrap projects using **React**, **React Native**, and **Next.js**. It automates common setup tasks such as folder structure creation, Redux integration, dependency installation, Tailwind CSS configuration, authentication functionality, and more — saving you hours of setup time.

## 🚀 Features

✔ Generates folder structures for React, React Native, and Next.js  
✔ Configures Redux and Redux Persist setup  
✔ Automatically installs required dependencies  
✔ Tailwind CSS setup included  
✔ Provides Login and Register pages with functional authentication flow  
✔ Generates 10+ reusable components (buttons, forms, modals, etc.)  
✔ Pre-configured navigation and routing  
✔ Supports JavaScript and TypeScript projects  
✔ Optimized for best practices and scalability

## Install Pro CLI globally:

```bash
npm install -g pro-cli
```

## 🚀 Create a new project:

```bash
pro-cli
```

## 📂 Folder Structures

### ✅ **React Folder Structure**

```bash
my-react-app/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ ├── context/
│ ├── hooks/
│ ├── pages/
│ ├── redux/
│ ├── services/
│ ├── styles/
│ └── utils/
├── .gitignore
├── package.json
└── tailwind.config.js
```

### ✅ **React Native Folder Structure**

```bash
my-react-native-app/
├── assets/
├── components/
├── navigation/
├── redux/
├── screens/
├── services/
├── utils/
├── App.js
├── babel.config.js
├── metro.config.js
└── package.json
```

### ✅ **Next.js Folder Structure**

```bash
my-next-app/
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── redux/
│ ├── services/
│ ├── styles/
│ └── utils/
├── .env.local
├── next.config.js
├── package.json
└── tailwind.config.js
```

## 📦 Installed Dependencies

### Common

- `redux`, `react-redux`, `redux-thunk`, `redux-persist`
- `axios` for API requests
- `formik` for form handling
- `yup` for form validation
- `react-router-dom` (React), `@react-navigation/native` (React Native), `next/router` (Next.js)

### Styling

- `tailwindcss`, `postcss`, `autoprefixer`

### Authentication

- Pre-built Login and Register pages with API service template
