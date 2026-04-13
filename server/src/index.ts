// server/src/index.ts
console.log("🤖 欢迎来到 Sunday Agent 核心引擎！");

let counter = 0;
setInterval(() => {
  counter++;
  console.log(`⏱️ 核心引擎正在后台运行... 心跳: ${counter}`);
}, 2000);