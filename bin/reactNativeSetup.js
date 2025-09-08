const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

async function reactNativeSetup(projectPath, answers) {
  console.log("\n🚀 Creating React Native project...");

  // 1️⃣ Create RN app with expo (for simplicity)
  execSync(`npx @react-native-community/cli init ${answers.projectName}`, {
    stdio: "inherit",
  });

  // 2️⃣ Folder structure
  console.log("\n✨ Creating folder structure...");

  const folders = [
    "assets",
    "src/components",
    "src/navigation",
    "src/screens",
    "src/store",
    "src/services",
    "src/hooks",
    "src/utils",
    "src/styles",
  ];
  folders.forEach((f) => fs.ensureDirSync(path.join(projectPath, f)));

  // 3️⃣ Install dependencies
  console.log("\n📦 Installing dependencies...");
  let deps = [];
  if (answers.extras.includes("Axios")) deps.push("axios");
  if (answers.extras.includes("Toast")) deps.push("react-native-toast-message");
  if (answers.extras.includes("Icons")) deps.push("@expo/vector-icons");
  if (answers.extras.includes("Formik")) deps.push("formik");
  if (answers.extras.includes("Redux")) deps.push("@reduxjs/toolkit", "react-redux");

  if (deps.length > 0) {
    execSync(`npm install ${deps.join(" ")}`, {
      stdio: "inherit",
      cwd: projectPath,
    });
  }

  // 4️⃣ Navigation setup with React Navigation
  console.log("\n📱 Setting up navigation...");
  execSync(
    `npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context`,
    { stdio: "inherit", cwd: projectPath }
  );

  // 5️⃣ Create basic files like App.js, navigation, and screens
  createBasicFiles(projectPath, answers);

  console.log("\n✅ React Native project setup complete!");
  console.log(`cd ${answers.projectName} && npx expo start`);
}

function createBasicFiles(projectPath, answers) {
  const srcDir = path.join(projectPath, "src");
  const appFile = path.join(projectPath, "App.js");
  const navDir = path.join(srcDir, "navigation");
  const screensDir = path.join(srcDir, "screens");

  // App.js
  fs.writeFileSync(
    appFile,
    `
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import DetailsScreen from "./src/screens/DetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
    `.trim(),
    "utf-8"
  );

  // HomeScreen.js
  fs.writeFileSync(
    path.join(screensDir, "HomeScreen.js"),
    `
import React from "react";
import { View, Text, Button } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate("Details")} />
    </View>
  );
};

export default HomeScreen;
    `.trim(),
    "utf-8"
  );

  // DetailsScreen.js
  fs.writeFileSync(
    path.join(screensDir, "DetailsScreen.js"),
    `
import React from "react";
import { View, Text, Button } from "react-native";

const DetailsScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Details Screen</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default DetailsScreen;
    `.trim(),
    "utf-8"
  );

  // 6️⃣ Redux Setup
  if (answers.extras.includes("Redux")) {
    const storeDir = path.join(srcDir, "store");
    const storeFile = path.join(storeDir, "index.js");
    const sliceFile = path.join(storeDir, "counterSlice.js");

    fs.writeFileSync(
      storeFile,
      `
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
      `.trim(),
      "utf-8"
    );

    fs.writeFileSync(
      sliceFile,
      `
import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
      `.trim(),
      "utf-8"
    );

    // Wrap App with Provider in App.js
    const appContent = fs.readFileSync(appFile, "utf-8");
    const newAppContent = appContent.replace(
      "export default function App() {",
      `import { Provider } from 'react-redux';
import { store } from './src/store';
export default function App() {`
    ).replace(
      "<NavigationContainer>",
      `<Provider store={store}>
        <NavigationContainer>`
    ).replace(
      "</NavigationContainer>",
      `</NavigationContainer>
      </Provider>`
    );

    fs.writeFileSync(appFile, newAppContent, "utf-8");
  }

  // 7️⃣ Create 10 reusable components
  const componentsDir = path.join(srcDir, "components");
  const components = [
    { name: "Button", content: createButtonComponent() },
    { name: "Input", content: createInputComponent() },
    { name: "Card", content: createCardComponent() },
    { name: "Avatar", content: createAvatarComponent() },
    { name: "Dialog", content: createDialogComponent() },
    { name: "DropdownMenu", content: createDropdownMenuComponent() },
    { name: "Switch", content: createSwitchComponent() },
    { name: "Form", content: createFormComponent() },
    { name: "Toast", content: createToastComponent() },
    { name: "Loader", content: createLoaderComponent() },
  ];

  components.forEach(({ name, content }) => {
    fs.writeFileSync(path.join(componentsDir, `${name}.js`), content, "utf-8");
  });
}

// Example reusable component templates
function createButtonComponent() {
  return `
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const Button = ({ onPress, title }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}>
      <Text style={{ color: '#fff', textAlign: 'center' }}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
  `.trim();
}

function createInputComponent() {
  return `
import React from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = ({ label, value, onChangeText, placeholder }) => {
  return (
    <View style={{ marginBottom: 10 }}>
      {label && <Text style={{ marginBottom: 5 }}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
      />
    </View>
  );
};

export default Input;
  `.trim();
}

function createCardComponent() {
  return `
import React from 'react';
import { View } from 'react-native';

const Card = ({ children }) => {
  return (
    <View style={{ padding: 15, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 }}>
      {children}
    </View>
  );
};

export default Card;
  `.trim();
}

function createAvatarComponent() {
  return `
import React from 'react';
import { Image } from 'react-native';

const Avatar = ({ src, size = 50 }) => {
  return (
    <Image
      source={{ uri: src }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
};

export default Avatar;
  `.trim();
}

function createDialogComponent() {
  return `
import React from 'react';
import { Modal, View, Text, Button } from 'react-native';

const Dialog = ({ visible, onClose, children }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066' }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
          {children}
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default Dialog;
  `.trim();
}

function createDropdownMenuComponent() {
  return `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const DropdownMenu = ({ label, options }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ padding: 10, backgroundColor: '#eee', borderRadius: 4 }}>
        <Text>{selected || label}</Text>
      </TouchableOpacity>
      {open && (
        <FlatList
          data={options}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setSelected(item); setOpen(false); }} style={{ padding: 10 }}>
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

export default DropdownMenu;
  `.trim();
}

function createSwitchComponent() {
  return `
import React from 'react';
import { View, Switch as RNSwitch } from 'react-native';

const Switch = ({ value, onValueChange }) => {
  return (
    <View>
      <RNSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
};

export default Switch;
  `.trim();
}

function createFormComponent() {
  return `
import React from 'react';
import { View } from 'react-native';

const Form = ({ children }) => {
  return <View style={{ padding: 10 }}>{children}</View>;
};

export default Form;
  `.trim();
}

function createToastComponent() {
  return `
import React from 'react';
import { View, Text } from 'react-native';

const Toast = ({ message }) => {
  return (
    <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, padding: 10, backgroundColor: '#333', borderRadius: 8 }}>
      <Text style={{ color: '#fff' }}>{message}</Text>
    </View>
  );
};

export default Toast;
  `.trim();
}

function createLoaderComponent() {
  return `
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const Loader = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
};

export default Loader;
  `.trim();
}

module.exports = { reactNativeSetup };
