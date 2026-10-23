# 第三方来源

- 网站运行时、Shader、场景参数、环境模型、纹理、字形图集与音乐来自 [Active Theory](https://activetheory.net/) 公开发布版 `1780406240914`，保存版本时间为 2026-09-30。下载资源的原版权与原有声明保留；公开可下载不代表统一开源许可，本仓库没有为这些资源附加 MIT 等许可证。
- `vendor/activetheory/SOURCE.json` 记录公开来源、版本、原始运行包指纹及旧凭证字面量的移除数量。基线保存的是当前网站构建所需代码，不包含原站私有服务。
- Bodoni Moda 字体许可为 SIL Open Font License，原许可保存在 [src/assets/OFL.txt](src/assets/OFL.txt)。
- Node.js 工具依赖为 ws、Three.js、Sharp 和 Playwright；版本锁定在 `package-lock.json`，各包自己的许可随安装包提供。压缩资源的 Draco/Basis 解码器保留原文件声明。
- Daily Design .Art 内容、D 几何、字标与封面适配由本项目提供；不把整个原站发布包或音乐的版权声明改成项目自有。

## Rhine Lab adaptation (2026-10-14)

- 登录前半段代码、标志路径和固定字形来自 [LBEILC/RhineLabUI](https://github.com/LBEILC/RhineLabUI)。MIT 声明完整保存在 `src/boot/upstream/LICENSE`。复制开场所需代码，保留其原时间轴；本地改为深色加载界面，停于欢迎页，并接入主站加载信号。代码许可不扩大第三方品牌与字体的许可范围。
- 开场仅使用仓库内固定字形图形与 MiSans 拉丁字符子集，没有下载或提取其独立商业 Novecento 字体包。MiSans 许可保留于 `src/boot/fonts/MiSans-license.pdf`。
- 莱茵生命标志的三维几何根据共享轮廓生成，继承原品牌图形的权利限制。这一分支保留该几何，因为场景变换和材质绑在它上面。
- 这一分支不再收录十四幅《明日方舟》CG。展板来自 Project-X 宣传站的实机截图和纸锋排版，源图在 `src/assets/promo/`，尺寸与 SHA-256 见 `src/assets/rhine/sources.json`。截图属于宣传站所展示的系统界面，不因放进展板而改变权利。

## Project-X studies (2026-10-18)

- 纸色 `#F1EFE9`、墨色 `#1A1917`、亮蓝 `#2E44FF` 和硬偏移边取自宣传站样式里与主站纸锋皮肤对齐的值。
- 展陈英文是宣传页内容的压缩，不是主站界面里的原文，也不冒充产品里没有的界面。
- 登录欢迎页的词标改成 PROJECT X。原字母表没有 X，这一笔是按同一坐标系补的图形。揭示用的帧窗口保持原值。三维轮廓仍是上游标志几何。
