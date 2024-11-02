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
import { EditorState, StateEffect, Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";

export default {
  setup() {
    const editor = ref(null);
    const inputTest = ref("");
    const output = ref("");
    const selectedLanguage = ref("cpp"); // 默认设置为 C++
    const problemDescription = ref("");

    let editorView;

    // 使用 Compartment 动态管理语言扩展
    const languageCompartment = new Compartment();

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
      const languageExtension = getLanguageExtension(selectedLanguage.value);

      editorView = new EditorView({
        state: EditorState.create({
          doc: "", // 初始不显示任何代码提示
          extensions: [
            basicSetup,
            languageCompartment.of(languageExtension),
            EditorView.lineWrapping,
            EditorView.theme({
              "&.cm-editor": {
                textAlign: "left", // 确保文本左对齐
                minHeight: "400px", // 设置编辑器最小高度
              },
              ".cm-content": {
                textAlign: "left", // 确保代码编辑内容左对齐
              },
            }),
          ],
        }),
        parent: editor.value,
      });
    };

    const updateLanguage = () => {
      if (editorView) {
        const languageExtension = getLanguageExtension(selectedLanguage.value);

        // 通过 Compartment 更新语言扩展，不修改现有的代码内容
        editorView.dispatch({
          effects: languageCompartment.reconfigure(languageExtension),
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
  padding: 0; /* 去除内边距 */
  background-color: #f9fafb;
  width: 100%; /* 宽度100% */
  height: 100vh; /* 高度100vh以填满浏览器 */
}

/* 问题描述区域 */
.problem-container {
  flex: 1; /* 让问题描述区域填满剩余空间 */
  padding: 20px;
  background-color: #ffffff;
  border-right: 1px solid #ddd;
  overflow-y: auto; /* 允许问题描述区域滚动 */
}

/* 样式 */
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
  flex: 2; /* 让代码编辑区域填满剩余空间 */
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
  flex: 1; /* 让编辑器区域占据剩余空间 */
  background: #f7f7f8;
  color: #333;
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto; /* 允许代码编辑器滚动 */
  font-family: monospace;
  border: 1px solid #ddd;
}

/* 输入和输出框 */
.input-output-container {
  display: flex;
  gap: 20px;
}

.input-container, .output-container {
  flex: 1; /* 让输入输出框填满剩余空间 */
  background-color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  max-height: 150px; /* 限制最大高度以避免溢出 */
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

