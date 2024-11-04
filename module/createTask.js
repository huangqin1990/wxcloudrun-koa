
const OpenAI = require('openai')

const taskResults = new Map()

const processTicketInfo = async (taskId, image) => {
    try {
        const openai = new OpenAI({
            apiKey: 'sk-6f4bd001cba94fc28343ff6efc480699',
            baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
        });
        const completion = await openai.chat.completions.create({
            model: "qwen-vl-max",
            messages: [{
                role: "user", content: [
                    { type: "text", text: "只需要票的出行信息" },
                    { type: "image_url", image_url: { "url": "https://7072-prod-9gctejvpcf0cb9ec-1305304192.tcb.qcloud.la/1381730112226_.pic.jpg?sign=3f62b3c00b9b3bb5a1d8e8ea9809160b&t=1730574397" } }
                ]
            }]
        });
        const content = completion.choices[0].message.content;
        taskResults.set(taskId, {
            status: 'completed',
            data: content
        });
        // 延迟30秒后清理，确保前端有足够时间获取结果
        setTimeout(() => {
            taskResults.delete(taskId);
        }, 30000);

    } catch (e) {

    }
}

const createTicketInfoTask = (image = 'test') => {
    const taskId = crypto.randomUUID().slice(0, 8);
    taskResults.set(taskId, { status: 'pending' });
    // 传入图片参数
    processTicketInfo(taskId, image).catch(console.error);
    return { taskId };
}

// 获取任务状态和结果
const getTaskStatus = taskId => {
    const result = taskResults.get(taskId);
    if (!result) {
        throw new Error('Task not found');
    }
    return result;
}

module.exports = {
    taskResults,
    createTicketInfoTask,
    getTaskStatus
}