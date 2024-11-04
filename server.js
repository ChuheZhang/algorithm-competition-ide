// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer'); // 引入 puppeteer
const winston = require('winston'); // 引入 winston

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 使用 winston 创建日志记录器
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // 输出到控制台
        new winston.transports.File({ filename: 'error.log', level: 'error' }), // 输出到文件
        new winston.transports.File({ filename: 'combined.log' }) // 输出所有级别到文件
    ]
});

// 延迟函数，用于控制请求间隔
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取比赛题目列表和详细描述
app.post('/get-contest-problems', async (req, res) => {
    const { contestId } = req.body;

    try {
        const response = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=100`);

        if (response.data.status !== "OK") {
            return res.status(500).json({ error: "无法获取题目列表" });
        }

        // 启动 Puppeteer 浏览器
        const browser = await puppeteer.launch({ headless: false }); // 使用 headful 模式便于调试
        const problems = await Promise.all(response.data.result.problems.map(async (problem, index) => {
            await delay(index * 5000); // 每个请求之间增加 5 秒的间隔

            try {
                const problemUrl = `https://codeforces.com/contest/${contestId}/problem/${problem.index}`;
                logger.info(`正在访问题目页面: ${problemUrl}`); // 打印 URL，确认其正确性

                const page = await browser.newPage();
                await page.goto(problemUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 60000 // 设置超时时间为 60 秒
                });

                // 打印页面内容以便调试
                const pageContent = await page.content();
                logger.info(`页面内容: ${pageContent}`);

                // 使用 Puppeteer 获取题目描述
                const description = await page.evaluate(() => {
                    const problemElement = document.querySelector('div.problem-statement');
                    if (problemElement) {
                        let descriptionHtml = '';
                        problemElement.querySelectorAll('div').forEach(div => {
                            descriptionHtml += div.innerHTML + '\n';
                        });
                        return descriptionHtml;
                    }
                    return '无法获取详细描述';
                });

                logger.info(`获取到题目描述: ${description}`); // 打印获取到的描述内容

                return {
                    contestId: problem.contestId,
                    index: problem.index,
                    name: problem.name,
                    description: description
                };
            } catch (innerError) {
                logger.error(`获取题目描述失败: ${innerError.message}`);
                return {
                    contestId: problem.contestId,
                    index: problem.index,
                    name: problem.name,
                    description: "无法获取详细描述"
                };
            }
        }));

        await browser.close();
        res.json({ problems });
    } catch (error) {
        logger.error(`请求失败的详细信息: ${error.message}, ${error.stack}`);
        res.status(500).json({ error: "请求失败，请检查比赛ID" });
    }
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
            logger.error(`运行代码失败: ${stderr}`);
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
    logger.info('Server is running on http://localhost:3000');
});

// Prevent Tab key from moving focus to the next input field
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self'");
    next();
});
