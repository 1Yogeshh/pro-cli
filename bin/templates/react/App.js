import React from "react";

function App() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen flex justify-center items-center flex-col gap-8 px-6">
      {/* Animated Loading Indicator */}
      <div class="h-2 w-2 relative  animate-ping bg-green-300 rounded-full flex items-center justify-center">
        <div class="absolute h-2  w-2 bg-blue-500 animate-spin"></div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-4xl space-y-6">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-100 text-6xl md:text-7xl font-bold leading-tight">
          Welcome to the Future
        </h1>

        <h2 className="text-gray-400 text-2xl md:text-3xl font-semibold">
          React App powered by Pro-CLI ✨
        </h2>

        <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Experience the next generation of web development with our
          cutting-edge React application. Built with modern tools, designed for
          performance, and crafted for an exceptional user experience.
        </p>
      </div>
    </div>
  );
}

export default App;
