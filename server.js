// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 模拟从Codeforces获取的题目信息
app.get('/codeforces-problem', (req, res) => {
    res.json({
        description: `
            <h4>Sample Problem: Two Sum</h4>
            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
            <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
            <h5>Example:</h5>
            <pre>
                Input: nums = [2, 7, 11, 15], target = 9
                Output: [0, 1]
                Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
            </pre>
        `
    });
});

// 运行代码的路由
app.post('/run-code', (req, res) => {
    const { code, language, input } = req.body;
    const commands = {
        javascript: `node -e "${code.replace(/"/g, '\\"')}"`,
        python: `python3 -c "${code.replace(/"/g, '\\"')}"`,
        cpp: `g++ -o temp && ./temp`,
    };

    const command = commands[language];
    if (!command) return res.status(400).send('Unsupported language');

    exec(command, (error, stdout, stderr) => {
        if (error) return res.json({ output: stderr });
        res.json({ output: stdout });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

const express = require("express");
const cors = require("cors"); // 引入 CORS 中间件

const app = express();
app.use(cors()); // 启用 CORS
app.use(express.json());

// 示例路由
app.get("/codeforces-problem", (req, res) => {
  res.json({ description: "This is a sample problem from Codeforces." });
});

// 监听端口
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

