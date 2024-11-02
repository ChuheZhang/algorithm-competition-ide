<template>
  <div id="app" class="app-container">
    <!-- Problem Description Section -->
    <div class="problem-container">
      <h3 class="section-title">Problem Description</h3>
      <div v-html="problemDescription" class="problem-description"></div>
    </div>

    <!-- Code Editor and Output Section -->
    <div class="editor-container">
      <div class="editor-controls">
        <label for="language" class="form-label">Select Language:</label>
        <select v-model="selectedLanguage" id="language" class="form-control language-select" @change="updateLanguage">
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button @click="runCode" class="btn btn-run">Run Code</button>
      </div>

      <!-- CodeMirror Editor -->
      <div ref="editor" class="code-editor"></div>

      <!-- Input and Output Sections -->
      <div class="input-output-container">
        <div class="input-container">
          <h5>Input</h5>
          <textarea v-model="inputTest" class="form-control input-area" rows="4"></textarea>
        </div>
        <div class="output-container">
          <h5>Output</h5>
          <pre class="output-area">{{ output }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";

export default {
  setup() {
    const editor = ref(null);
    const code = ref("// Write your C++ code here...\n");
    const inputTest = ref("");
    const output = ref("");
    const selectedLanguage = ref("cpp"); // 默认设置为 C++
    const problemDescription = ref("");

    let editorView;

    // 动态更新语言扩展
    const getLanguageExtension = (language) => {
      switch (language) {
        case "javascript":
          return javascript();
        case "python":
          return python();
        case "cpp":
        default:
          return cpp();
      }
    };

    const initializeEditor = () => {
      editorView = new EditorView({
        state: EditorState.create({
          doc: code.value,
          extensions: [
            basicSetup,
            getLanguageExtension(selectedLanguage.value), // 根据默认语言设置扩展
            EditorView.lineWrapping,
            EditorView.theme({
              "&.cm-editor": { textAlign: "left" },
            }),
          ],
        }),
        parent: editor.value,
      });
    };

    const updateLanguage = () => {
      if (editorView) {
        const languageExtension = getLanguageExtension(selectedLanguage.value);
        editorView.dispatch({
          effects: EditorState.reconfigure.of([basicSetup, languageExtension, EditorView.lineWrapping]),
        });

        // 根据选择的语言更新代码模板
        code.value =
          selectedLanguage.value === "cpp"
            ? "// Write your C++ code here...\n"
            : selectedLanguage.value === "javascript"
            ? "// Write your JavaScript code here...\n"
            : "# Write your Python code here...\n";

        // 将新模板设置到编辑器
        editorView.dispatch({
          changes: { from: 0, to: editorView.state.doc.length, insert: code.value },
        });
      }
    };

    const runCode = async () => {
      if (editorView) {
        const response = await fetch("http://localhost:3000/run-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: editorView.state.doc.toString(),
            language: selectedLanguage.value,
            input: inputTest.value,
          }),
        });
        const data = await response.json();
        output.value = data.output;
      }
    };

    onMounted(() => {
      initializeEditor();

      // Fetch problem description
      fetch("http://localhost:3000/codeforces-problem")
        .then((res) => res.json())
        .then((data) => {
          problemDescription.value = data.description;
        });
    });

    return {
      editor,
      code,
      inputTest,
      output,
      selectedLanguage,
      problemDescription,
      runCode,
      updateLanguage,
    };
  },
};
</script>

<style>
/* 整体布局 */
.app-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
  background-color: #f9fafb;
  height: 100vh;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

/* 问题描述区域 */
.problem-container {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.problem-description {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

/* 编辑器和输出区域 */
.editor-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f5f6f7;
  padding: 20px;
  border-radius: 8px;
}

.editor-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.language-select {
  width: 150px;
  padding: 5px;
}

.btn-run {
  background-color: #28a745;
  color: white;
  padding: 5px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.code-editor {
  flex: 1;
  background: #f7f7f8;
  color: #333;
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  border: 1px solid #ddd;
}

/* 输入和输出框 */
.input-output-container {
  display: flex;
  gap: 20px;
}

.input-container, .output-container {
  flex: 1;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.input-area, .output-area {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: monospace;
  color: #333;
}

.output-area {
  background-color: #f5f6f7;
}
</style>

