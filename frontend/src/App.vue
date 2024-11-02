<template>
  <div id="app" class="app-container">
    <!-- Problem Description Section -->
    <div class="problem-container">
      <h3 class="section-title">Problem Description</h3>
      <div v-html="problemDescription" class="problem-description"></div>
    </div>

    <!-- Code Editor and Input/Output Section -->
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

      <!-- Input, Target, and Output Sections -->
      <div class="input-target-output-section">
        <!-- Input and Target Section -->
        <div class="input-target-container">
          <!-- Input Section -->
          <div class="input-output-box">
            <label for="inputArea" class="input-output-title">Input:</label>
            <textarea v-model="inputTest" id="inputArea" class="form-control input-area" rows="4"></textarea>
          </div>

          <!-- Target Section -->
          <div class="input-output-box">
            <label for="targetArea" class="input-output-title">Target:</label>
            <textarea v-model="targetOutput" id="targetArea" class="form-control target-area" rows="4"></textarea>
          </div>
        </div>

        <!-- Output Section -->
        <div class="input-output-box output-box">
          <label for="outputArea" class="input-output-title">Output:</label>
          <textarea v-model="output" id="outputArea" :class="outputClass" class="form-control output-area" rows="4"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { EditorState, Compartment } from "@codemirror/state";
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
    const targetOutput = ref("");
    const selectedLanguage = ref("cpp");
    const problemDescription = ref("");

    let editorView;
    const languageCompartment = new Compartment();

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
          doc: "",
          extensions: [
            basicSetup,
            languageCompartment.of(languageExtension),
            EditorView.lineWrapping,
            EditorView.theme({
              "&.cm-editor": {
                textAlign: "left",
                minHeight: "400px",
                height: "100%",
                overflow: "auto",
              },
              ".cm-content": {
                textAlign: "left",
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

    const outputClass = computed(() => {
      if (output.value === "") return "output-area";
      return output.value.trim() === targetOutput.value.trim()
        ? "output-area success"
        : "output-area failure";
    });

    onMounted(() => {
      initializeEditor();

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
      targetOutput,
      selectedLanguage,
      problemDescription,
      runCode,
      updateLanguage,
      outputClass,
    };
  },
};
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
  background-color: #f9fafb;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.problem-container {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  height: 100%;
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

.editor-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f5f6f7;
  padding: 20px;
  border-radius: 8px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
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
  overflow: auto;
  font-family: monospace;
  border: 1px solid #ddd;
  height: calc(50% - 20px);
}

.input-target-output-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: calc(50% - 20px);
}

.input-target-container {
  display: flex;
  gap: 20px;
  flex: 1;
}

.input-output-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: 100%;
}

.input-output-title {
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
}

.input-area, .target-area, .output-area {
  flex: 1;
  height: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: monospace;
  color: #333;
  background-color: #f9fafb;
  overflow: auto;
}

.output-box {
  flex: 1;
  overflow: auto;
  height: 100%;
}

.output-area.success {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.output-area.failure {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>

