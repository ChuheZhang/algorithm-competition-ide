<template>
  <div id="app" class="app-container">
    <!-- 问题描述部分 -->
    <div class="problem-container" :style="{ width: leftWidth + 'px' }">
      <div v-if="contestProblems.length" class="problem-list">
        <h3>题目列表</h3>
        <ul>
          <li v-for="problem in contestProblems" :key="problem.index">
            <a href="#" @click.prevent="loadProblem(problem)">{{ problem.index }}</a>
          </li>
        </ul>
      </div>
      <div v-html="renderedDescription" class="problem-description"></div>
    </div>

    <!-- 分隔栏 -->
    <div class="divider" @mousedown="initDrag"></div>

    <!-- 代码编辑器和输入/输出部分 -->
    <div class="editor-container" :style="{ width: rightWidth + 'px' }">
      <div class="editor-controls">
        <input
          type="text"
          placeholder="输入比赛ID"
          v-model="contestId"
          class="form-control contest-input"
        />
        <button @click="fetchContestProblems" class="btn btn-fetch">
          获取比赛题目
        </button>
        <label for="language" class="form-label">Language:</label>
        <select
          v-model="selectedLanguage"
          id="language"
          class="form-control language-select"
          @change="updateLanguage"
        >
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button @click="runCode" class="btn btn-run" :disabled="isLoading">
          <span v-if="isLoading">运行中...</span>
          <span v-else>运行代码</span>
        </button>
      </div>

      <!-- CodeMirror 编辑器 -->
      <div ref="editor" class="code-editor"></div>

      <!-- 输入和目标部分 -->
      <div class="input-target-output-section">
        <div class="input-target-container">
          <!-- 输入部分 -->
          <div class="input-output-box">
            <label for="inputArea" class="input-output-title">Input:</label>
            <textarea
              v-model="inputTest"
              id="inputArea"
              class="form-control input-area"
              rows="4"
            ></textarea>
          </div>

          <!-- 目标部分 -->
          <div class="input-output-box">
            <label for="targetArea" class="input-output-title">Target:</label>
            <textarea
              v-model="targetOutput"
              id="targetArea"
              class="form-control target-area"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- 输出部分 -->
        <div v-if="outputVisible" class="input-output-box output-box">
          <label for="outputArea" class="input-output-title">Output:</label>
          <textarea
            :class="outputClass"
            v-model="output"
            id="outputArea"
            class="form-control output-area"
            rows="4"
            readonly
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios"; // 引入 axios
import { EditorState, Compartment } from "@codemirror/state"; // 确保引入 Compartment
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
    const contestId = ref("");
    const contestProblems = ref([]);
    const currentProblem = ref(null);
    const isLoading = ref(false);
    const outputVisible = ref(false); // 控制输出框的显示

    // 计算属性，用于将 Markdown 转换为 HTML
    const renderedDescription = computed(() =>
      currentProblem.value ? `### ${currentProblem.value.index}: ${currentProblem.value.name}` : ""
    );

    // 获取比赛题目列表的函数
    const fetchContestProblems = async () => {
      try {
        const response = await axios.post("http://localhost:3000/get-contest-problems", { contestId: contestId.value });
        contestProblems.value = response.data.problems;
      } catch (error) {
        alert("获取比赛题目失败，请检查比赛ID。");
      }
    };

    // 加载选定题目的描述
    const loadProblem = (problem) => {
      currentProblem.value = problem;
    };

    // 初始宽度设置
    const initialWidth = 960; // 1920 / 2
    const leftWidth = ref(initialWidth);
    const rightWidth = ref(initialWidth);

    let editorView;
    const languageCompartment = new Compartment();

    const languages = [
      { value: "cpp", label: "C++", extension: cpp() },
      { value: "javascript", label: "JavaScript", extension: javascript() },
      { value: "python", label: "Python", extension: python() },
    ];

    const getLanguageExtension = (language) => {
      const lang = languages.find((l) => l.value === language);
      return lang ? lang.extension : cpp();
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
      isLoading.value = true;
      outputVisible.value = true; // 点击运行后显示输出框
      try {
        const response = await fetch("http://localhost:3000/run-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: editorView.state.doc.toString(),
            language: selectedLanguage.value,
            input: inputTest.value,
          }),
        });

        if (!response.ok) {
          throw new Error(`服务器错误: ${response.statusText}`);
        }

        const data = await response.json();
        output.value = data.output || "未收到输出。";

        // 在这里判断输出是否与目标一致
        if (output.value.trim() === targetOutput.value.trim()) {
          // 如果一致，设置为成功样式
          outputClass.value = "output-area success";
        } else {
          // 如果不一致，设置为失败样式
          outputClass.value = "output-area failure";
        }
      } catch (error) {
        output.value = `错误: ${error.message}`;
        outputClass.value = "output-area failure"; // 错误时也标记为失败
      } finally {
        isLoading.value = false;
      }
    };

    // 初始化输出类
    const outputClass = ref("output-area");

    onMounted(() => {
      initializeEditor();
      fetch("http://localhost:3000/codeforces-problem")
        .then((res) => res.json())
        .then((data) => {
          problemDescription.value = data.description;
        });
    });

    // 拖拽相关
    const isDragging = ref(false);
    const startX = ref(0);
    const startLeftWidth = ref(initialWidth);
    const startRightWidth = ref(initialWidth);

    const initDrag = (event) => {
      isDragging.value = true;
      startX.value = event.clientX;
      startLeftWidth.value = leftWidth.value;
      startRightWidth.value = rightWidth.value;

      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDrag);
    };

    const onDrag = (event) => {
      if (!isDragging.value) return;
      const deltaX = event.clientX - startX.value;
      const newLeftWidth = startLeftWidth.value + deltaX;
      const newRightWidth = startRightWidth.value - deltaX;

      const minWidth = 300;
      if (newLeftWidth > minWidth && newRightWidth > minWidth) {
        leftWidth.value = newLeftWidth;
        rightWidth.value = newRightWidth;
      }
    };

    const stopDrag = () => {
      isDragging.value = false;
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };

    return {
      editor,
      inputTest,
      output,
      targetOutput,
      selectedLanguage,
      problemDescription,
      contestId,
      contestProblems,
      currentProblem,
      renderedDescription,
      fetchContestProblems,
      loadProblem,
      runCode,
      updateLanguage,
      outputClass,
      isLoading,
      outputVisible,
      leftWidth,
      rightWidth,
      initDrag,
    };
  },
};
</script>





<style scoped>
/* 让整个网页填满浏览器宽度和高度 */
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

/* 整体布局 */
.app-container {
  display: flex;
  flex-direction: row;
  background-color: #f9fafb;
  width: 100%;
  height: 100vh; /* 使用视口高度 */
  box-sizing: border-box;
  margin: 0 auto; /* 居中容器 */
  max-width: 1920px; /* 限制最大宽度为1920px */
  position: relative;
}

/* 分隔栏样式 */
.divider {
  width: 5px;
  background-color: #ccc;
  cursor: col-resize;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 问题描述区域 */
.problem-container {
  padding: 20px;
  background-color: #ffffff;
  border-right: 1px solid #ddd; /* 分隔线 */
  overflow-y: auto;
  height: 100%;
  word-break: break-word; /* 确保文本不会溢出 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 内容从上方开始 */
  box-sizing: border-box; /* 包含内边距和边框在内 */
}

/* 标题样式 */
.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 问题描述文本样式 */
.problem-description {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  text-align: left; /* 确保文本左对齐 */
}

/* 编辑器和输入、输出区域 */
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f5f6f7;
  padding: 20px;
  border-radius: 8px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box; /* 包含内边距和边框在内 */
}

/* 编辑器控制区域 */
.editor-controls {
  display: flex;
  justify-content: flex-end; /* 使内容靠右对齐 */
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* 语言选择下拉框 */
.language-select {
  width: 150px;
  padding: 5px;
}

/* 运行按钮 */
.btn-run {
  background-color: #28a745;
  color: white;
  padding: 5px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

/* 获取比赛题目按钮 */
.btn-fetch {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-right: 10px;
}

/* CodeMirror 编辑器样式 */
.code-editor {
  flex: 1;
  background: #f7f7f8;
  color: #333;
  border-radius: 8px;
  padding: 0;
  overflow: auto;
  font-family: monospace;
  border: 1px solid #ddd;
  height: 400px;
}

/* 输入、目标和输出区域 */
.input-target-output-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 输入和目标容器 */
.input-target-container {
  display: flex;
  gap: 20px;
  flex: 1;
}

/* 输入输出框 */
.input-output-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: 100%;
  box-sizing: border-box; /* 包含内边距和边框在内 */
}

/* 输入输出标题 */
.input-output-title {
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
}

/* 输入、目标和输出文本区域 */
.input-area,
.target-area,
.output-area {
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
  outline: none; /* 去掉虚线包围框 */
}

/* 输出区域 */
.output-box {
  flex: 1;
  overflow: auto;
  height: 100%;
}

/* 输出成功样式 */
.output-area.success {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

/* 输出失败样式 */
.output-area.failure {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

/* 响应式设计 */
@media (max-width: 1920px) {
  .app-container {
    width: 90%; /* 根据需要调整宽度 */
  }
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
    padding: 10px;
  }

  .problem-container,
  .editor-container {
    width: 100%; /* 在小屏幕上占满宽度 */
    border-right: none;
    border-bottom: 1px solid #ddd;
  }

  .editor-container {
    padding-top: 10px;
  }

  .divider {
    display: none; /* 小屏幕隐藏分隔栏 */
  }
}
</style>


