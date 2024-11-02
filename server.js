// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 模拟从Codeforces获取的题目信息
app.get('/codeforces-problem', (req, res) => {
    res.json({
        description: `
# Sample Problem: Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

## Example:
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`
        `
    });
});

// 运行代码的路由
app.post('/run-code', (req, res) => {
    const { code, language, input } = req.body;
    const commands = {
        javascript: `echo "${input}" | node -e "${code.replace(/"/g, '\"')}"`,
        python: `echo "${input}" | python3 -c "${code.replace(/"/g, '\"')}"`,
        cpp: `g++ temp.cpp -o temp && echo "${input}" | ./temp`,
    };

    if (language === 'cpp') {
        // 为 C++ 代码生成临时文件
        fs.writeFileSync('temp.cpp', code);
    }

    const command = commands[language];
    if (!command) return res.status(400).send('Unsupported language');

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.json({ output: stderr });
        }
        // 删除 C++ 临时文件
        if (language === 'cpp') {
            fs.unlinkSync('temp.cpp');
            fs.unlinkSync('temp'); // 删除可执行文件
        }
        res.json({ output: stdout });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Prevent Tab key from moving focus to the next input field
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self'");
    next();
});

