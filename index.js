const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
// const { init: initDB, Counter } = require("./db");
const { createTicketInfoTask, getTaskStatus } = require('./module/createTask')

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

let openai = null

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});


// 创建任务

router.post("/api/createTicketTask", (ctx) => {
  const { image } = ctx.request.body
  const result = createTicketInfoTask(image)
  console.log(image, 'image')
  ctx.body = {
    success: true,
    data: result,
  };
})

// 获取任务状态(前端轮询)
router.get('/api/taskStatus', async (ctx) => {
  const { taskId } = ctx.request.query
  const result = getTaskStatus(taskId)
  ctx.body = {
    success: true,
    data: result,
  };
})







// 查询图像

router.get("/api/getInfo", async (ctx) => {
  // const result = 
  if (!openai) {
    openai = new OpenAI(
      {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: 'sk-6f4bd001cba94fc28343ff6efc480699',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      }
    );
  }
  const completion = await openai.chat.completions.create({
    model: "qwen-vl-max",  //模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    messages: [{
      role: "user", content: [
        { type: "text", text: "票信息" },
        { type: "image_url", image_url: { "url": "https://7072-prod-9gctejvpcf0cb9ec-1305304192.tcb.qcloud.la/1381730112226_.pic.jpg?sign=3f62b3c00b9b3bb5a1d8e8ea9809160b&t=1730574397" } }
      ]
    }]
  }).catch(e => console.log(e))
  // console.log(completion.choices[0].message.content);
  ctx.body = {
    code: 0,
    data: completion.choices[0].message.content
  };
})



// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  // await initDB().catch(e => {
  //   console.log(e)
  // });
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();

