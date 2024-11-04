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

