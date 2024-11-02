<template>
  <div id="app" class="app-container">
    <!-- Problem Description Section -->
    <div class="problem-container">
      <h3>Problem Description</h3>
      <div v-html="problemDescription" class="problem-description"></div>
    </div>

    <!-- Code Editor and Output Section -->
    <div class="editor-container">
      <div class="editor-controls">
        <label for="language" class="form-label">Select Language:</label>
        <select v-model="selectedLanguage" id="language" class="form-control language-select">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
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
import { ref, onMounted, watch } from "vue";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";

export default {
  setup() {
    const editor = ref(null);
    const code = ref("// Write your code here...\n");
    const inputTest = ref("");
    const output = ref("");
    const selectedLanguage = ref("javascript");
    const problemDescription = ref("");

    let editorView;

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

    const initializeEditor = () => {
      const languageExtension =
        selectedLanguage.value === "javascript"
          ? javascript()
          : selectedLanguage.value === "python"
          ? python()
          : cpp();

      editorView = new EditorView({
        state: EditorState.create({
          doc: code.value,
          extensions: [basicSetup, languageExtension],
        }),
        parent: editor.value,
      });
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

    watch(selectedLanguage, () => {
      if (editorView) {
        const languageExtension =
          selectedLanguage.value === "javascript"
            ? javascript()
            : selectedLanguage.value === "python"
            ? python()
            : cpp();
        editorView.dispatch({
          effects: EditorState.reconfigure.of([basicSetup, languageExtension]),
        });
      }
    });

    return {
      editor,
      code,
      inputTest,
      output,
      selectedLanguage,
      problemDescription,
      runCode,
    };
  },
};
</script>

<style>
.app-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
  background-color: #f5f6f7;
  height: 100vh;
  overflow: hidden;
}

.problem-container {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.problem-description {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.editor-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.language-select {
  width: 150px;
}

.btn-run {
  background-color: #28a745;
  color: white;
}

.code-editor {
  flex: 1;
  height: 300px;
  background: #1e1e1e;
  color: white;
  border-radius: 8px;
  overflow-y: auto;
}

.input-output-container {
  display: flex;
  gap: 20px;
}

.input-container, .output-container {
  flex: 1;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 8px;
}

.input-area, .output-area {
  width: 100%;
  height: 100px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>

