# Project-X studies on the Rhine stage

Status: implemented

这一分支只换展陈内容。相机、滚动、GLSL、粒子、时长、光学材质和登录字形时间轴保持原发布版。

- 十四段文案、颜色、标签和链接在 `src/content.mjs`。
- 展板是纸锋纸色、墨线和硬偏移。有宣传站截图的直接镶进框里；没有截图的只排字，不补画系统界面。
- 三维标志仍用莱茵生命轮廓。换轮廓会改首页、About、TreeScene 和 CleanRoom 的外形。
- 欢迎页里的 RHINE LAB 是已经量过的字形动画，不改词。
- 静态 Pages 需要 `PAGES_BASE`。资源前缀只用 `HYDRA_BASE_PATH`，不再设置 `HYDRA_ASSETS_CDN`，避免和 `absolutePath` 叠成两段路径。搜索和 `/ws` 仍依赖 Node 服务。
- iPad 识别不再用 4:3 长宽比。Macintosh 且 `maxTouchPoints > 1` 视为 iOS 平板，拖拽滚动因此打开。原屏蔽名单（含 SwiftShader）仍会跳转 unsupported。有真实 WebGL2 的 iOS，即使基准测试把 GPU 写成 legacy，也不跳转。
- 平板的 `Tests.getDPR` 和主画布像素比提到 `min(devicePixelRatio, 2)`。手机和桌面的原分档不动。展板着色器只在解析 `WorkItemShader` / `WorkItemUIShader` 时减轻取样：侧向 UV 收到 `edges * 0.06`，折射只留在卡片外圈，板心接近原图。`compiled.vs` 字节不变，标志着色器不改。竖屏详情把超出可视宽度的图层收回来。筛选链接响应 touchend，最小高度 44px。
