# Algorithm Competition IDE

## Project Overview
This is an Integrated Development Environment (IDE) designed for algorithm competitions. The IDE allows users to write, run, and test code with a layout similar to competitive programming platforms like Codeforces or LeetCode. Built with Vue.js on the frontend and a Node.js backend for code execution.

## Features

- **Code Editor**: Syntax highlighting and language support for C++, JavaScript, and Python using CodeMirror.
- **One-Click Code Execution**: Runs code in the backend with user-provided input and displays results instantly.
- **Split-Screen Layout**: Adjustable layout with sections for problem description, code editor, input, and output.
- **Real-Time Problem Fetching**: Dynamically fetches problems to display in the description area.
- **Output Validation**: Automatically checks if the code output matches the target output, with success/failure highlights.

## Installation

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm**

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ChuheZhang/algorithm-competition-ide.git
   cd algorithm-competition-ide
   ```

2. **Install Dependencies**:
   Navigate to both frontend and backend directories and install the required packages.
   ```bash
   cd frontend
   npm install
   ```
   For backend:
   ```bash
   cd ../backend
   npm install
   ```

3. **Run the Project**:
   - Start the backend server:
     ```bash
     node server.js
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

4. **Access the Application**:
   Open your browser and go to `http://localhost:5173`.

## Usage

1. **Select a Language**: Choose between C++, JavaScript, and Python in the dropdown.
2. **Write Code**: Type your code in the editor, which provides syntax highlighting and formatting support.
3. **Input and Run**: Enter any custom input for your code and click "Run Code" to execute.
4. **Check Output**: Compare the output with the target output. If they match, the output area turns green; otherwise, it turns red.

## Project Structure

```
algorithm-competition-ide/
|
|-- backend/               # Backend server logic
|   |-- server.js          # Main backend server file
|
|-- frontend/              # Vue-based frontend interface
|   |-- src/
|       |-- App.vue        # Main component for IDE layout
|   |-- vite.config.js     # Vite configuration
|
|-- README.md              # Project documentation
```

## License

This project is licensed under the MIT License.

This README is available in both English and Chinese:
- **[中文版本](README.zh.md)**
- **[English Version](README.md)**

**God Bless You!**

--- 
