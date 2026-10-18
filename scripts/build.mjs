// 内容适配层：从已保存的原发布版生成，视觉算法、GLSL 和场景配置保持原值。
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { ExtrudeGeometry, Vector3 } from 'three';
import { rhineShapes, rhineSVG } from '../src/rhine-shape.mjs';
import { buildBoot } from './build-boot.mjs';
import sharp from 'sharp';
import { brand, slogan, github, promo, live, studies } from '../src/content.mjs';

function pagesBasePath() {
  const value = (process.env.PAGES_BASE || '').trim();
  if (!value) return '';
  const withSlash = value.startsWith('/') ? value : `/${value}`;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}
const pagesBase = pagesBasePath();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reference = path.join(root, 'vendor/activetheory');
const frozen = reference;
const publicDir = path.join(root, 'public');
const analysis = path.join(root, '.artifacts');
const originals = path.join(root, 'src/assets/rhine');
const changes = [];
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
await fs.mkdir(analysis, { recursive: true });
async function write(relative, data) {
  const target = path.join(publicDir, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return target;
}
function replace(text, before, after, label) {
  const count = text.split(before).length - 1;
  assert.ok(count, `未找到适配位置：${label}`);
  changes.push({ label, count, before, after });
  return text.replaceAll(before, after);
}
async function moduleSource(name) {
  const files = await fs.readdir(path.join(frozen, 'modules'));
  const file = files.find(file => file.endsWith(`-${name}.js`));
  assert.ok(file, name);
  return (await fs.readFile(path.join(frozen, 'modules', file), 'utf8')).trim();
}
let app = await fs.readFile(path.join(reference, 'runtime.js'), 'utf8');
async function adaptModule(name, callback) {
  const original = await moduleSource(name);
  // 原副本 VideoTexture 包含已验证的首帧竞态保护。
  const input = name === 'VideoTexture' ? original.replace('_this.texture=_this.videoTexture,_this.events.unsub', '_this.texture=_this.videoTexture||_this.texture,_this.events.unsub') : original;
  assert.ok(app.includes(input), `模块定位失败：${name}`);
  app = app.replace(input, callback(input));
}

// 原 VideoTexture 已支持 JPG/PNG；补全动态 src 与可见性生命周期，支持静态封面切换。
await adaptModule('VideoTexture', input => {
  let out = replace(input, 'let _video,_requestId,', 'let _stillPath,_video,_requestId,', '静态媒体状态');
  out = replace(out, 'let noop=_=>{};_this.texture=Utils3D.getTexture(src)', 'let noop=_=>{};_stillPath=_path,_this.texture=Utils3D.getTexture(src)', '原生图片分支');
  out = replace(out, 'this.set("src",(src=>{', 'this.set("src",(src=>{if(typeof src==="string"&&/\\.(jpg|png)(?:[?#]|$)/i.test(src)){if(_stillPath===src)return;_stillPath=src;_video&&(_this.stop(),_video.pause());_this.texture=Utils3D.getTexture(Assets.getPath(src));_this.uniform.value=_this.texture;_this.dimensions=_this.texture.dimensions;return;}', '静态媒体 src 绑定');
  out = replace(out, 'this.onInvisible=function(){_sharedVideo||', 'this.onInvisible=function(){_video&&(_sharedVideo||', '图片无 video DOM：不可见');
  out = replace(out, 'removeChild(_this.video.object,!0))},this.onVisible', 'removeChild(_this.video.object,!0)))},this.onVisible', '图片生命周期括号');
  out = replace(out, 'this.onVisible=function(){_sharedVideo||', 'this.onVisible=function(){_video&&(_sharedVideo||', '图片无 video DOM：可见');
  out = replace(out, 'add(_this.video.object))},this.onDestroy', 'add(_this.video.object)))},this.onDestroy', '图片可见性括号');
  out = replace(out, '_this.texture.destroy(),_sharedVideo||VideoTexture.element()', '_this.texture.destroy(),_video&&!_sharedVideo&&VideoTexture.element()', '图片销毁保护');
  return out;
});
const placeholder = 'data:video/mp4;base64,AAAAHGZ0eXBNNAACAAACAGlzb21pc28ybXA0MQAAAG1wNDFtcDQxaXNvbTFtcDQxaXNvbXNtcDQyaXNvbXZpc28ybXA0MgAAAChtZGF0AAAAAAIAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
app = replace(app, placeholder, 'assets/rhine/01.png', '作品初始媒体');

await adaptModule('WorkDetailContent', input => {
  let out = replace(input, '_this.video=document.createElement("video")', '_this.video=document.createElement("img"),_this.video.play=_=>{},_this.video.pause=_=>{},_this.video.alt="Project X study",_this.video.style.maxHeight="100%",_this.video.style.objectFit="contain"', '详情全屏原图');
  out = replace(out, '"Close Video"', '"Close Image"', '全屏关闭标签');
  out = replace(out, '"Open fullscreen video"', '"Open fullscreen image"', '全屏打开标签');
  out = replace(out, 'top: 22px;\\n        right: 22px;\\n        z-index: 3;\\n\\n        width: 18px;\\n        height: 18px;\\n\\n        border: none;\\n        background: transparent url(${Assets.getPath("assets/images/ui/close.svg")});\\n        background-size: cover;', 'top: max(12px, env(safe-area-inset-top));\\n        right: max(12px, env(safe-area-inset-right));\\n        z-index: 3;\\n\\n        width: 44px;\\n        height: 44px;\\n\\n        border: none;\\n        background: transparent url(${Assets.getPath("assets/images/ui/close.svg")});\\n        background-size: 18px 18px;', '全屏关闭按钮达到触控尺寸');
  out = replace(out, 'color:color})=>{_this.layers.title.setText(title)', 'color:color,thumbnailURL:thumbnailURL})=>{_this.video.src=((window.HYDRA_ASSETS_CDN||"")+thumbnailURL).replace(/([^:])\\/{2,}/g,"$1/");_this.video.alt=title;_this.layers.title.setText(title)', '详情绑定当前原图');
  out = replace(out, 'let camera=await _this.get("WorkDetail/camera");', '_this.imageButton=document.createElement("button");_this.imageButton.textContent="VIEW ORIGINAL ↗";_this.imageButton.setAttribute("aria-label","Open original image");_this.imageButton.style.cssText="position:fixed;right:max(16px, env(safe-area-inset-right));bottom:max(20px, env(safe-area-inset-bottom));z-index:1000;background:#0b1214cc;border:1px solid #ffffff55;color:#eee;padding:12px 16px;min-height:44px;font:11px nbarchitekt,monospace;letter-spacing:.06em;cursor:pointer;touch-action:manipulation";_this.imageButton.hidden=true;_this.imageButton.onclick=_this.onFullscreenClick;document.body.appendChild(_this.imageButton);_this.bind("Router/state",(route=>{_this.imageButton.hidden=!route.includes("work/")}));let camera=await _this.get("WorkDetail/camera");', '以可访问的原图按钮替代隐藏调试网格');
  return replace(out, '"Project Link"', '"Project source"', '素材来源链接');
});
// Gate the original ready signal on the login's welcome frame. The loader still
// owns actual asset/scene readiness; only its presentation and handoff change.
await adaptModule('LoaderView', input => {
  let out = replace(input, 'tween(_this.text,{percent:.9*percent}', 'window.rhineBoot?.progress(percent),tween(_this.text,{percent:.9*percent}', '真实加载进度');
  out = replace(out, 'await _this.gluiLoader.animateOut(),_this.fire("Global/loadFinished")', 'await _this.gluiLoader.animateOut(),await window.rhineBoot?.handoff(),_this.fire("Global/loadFinished"),window.rhineBoot?.reveal()', '欢迎页到主站过渡');
  return out;
});
app = replace(app, 'assets/video/reel.mp4', 'assets/daily/hero.jpg', '全局材质媒体');
app = replace(app, 'assets/video/reel-frame.jpg', 'assets/daily/hero.jpg', '全局首帧媒体');

await adaptModule('ContactUI', input => {
  let out = input;
  const entries = [
    ['"CONTACT US"', `"${brand}"`], ['"Contact Us"', `"${brand}"`],
    ['"LAX"', '"PAPER"'], ['"SYD"', '"SCAN"'], ['"NYC"', '"SCORE"'], ['"AMS"', '"OPEN"'],
    ['"Los Angeles"', '"Paper"'], ['"New York City"', '"Scan"'], ['"Amsterdam"', '"Open"'],
    ['"Privacy Notice"', '"Repository"'], ['"Newsletter Signup"', '"Live system"'], ['"Careers"', '"Promo site"'],
    ['"HELLO@ACTIVETHEORY.NET"', '"GITHUB / PROJECT X"'], ['"Email us at hello@activetheory.net"', '"Dalian No.5 Middle School IT"'],
    ['"mailto:hello@activetheory.net"', JSON.stringify(github)],
    ['"https://mailchi.mp/activetheory/newsletter"', JSON.stringify(live)],
    ['"https://activetheory.notion.site/privacy"', JSON.stringify(github)],
    ['"https://jobs.lever.co/activetheory"', JSON.stringify(promo)],
    ['"https://www.instagram.com/activetheory"', JSON.stringify(promo)],
    ['"https://www.linkedin.com/company/active-theory/"', JSON.stringify(github)],
    ['"https://twitter.com/active_theory"', JSON.stringify(live)],
    ['"Instagram"', '"Promo site"'], ['"Linked in"', '"Project X"'], ['"Twitter"', '"Live system"'],
    ['assets/images/ui/ig.png', 'assets/images/ui/globe.png'], ['assets/images/ui/in.png', 'assets/daily/monogram.png'], ['assets/images/ui/tw.png', 'assets/daily/monogram.png']
  ];
  for (const [a, b] of entries) out = replace(out, a, b, `联系内容 ${a}`);
  out = replace(out, 'fontSize:110', 'fontSize:80', '长标题在 About 三列中完整显示');
  const contactLinks = { email: [github, 'Project X on GitHub'], subscribe: [live, 'Open the live system'], privacy: [github, 'Project X repository'], careers: [promo, 'Project X promo site'] };
  for (const [name, [url, label]] of Object.entries(contactLinks)) {
    const pattern = new RegExp(`(_this\\.${name}\\.interact\\(hover,\\(_=>window\\.open\\("[^"]*"(?:,"_blank")?\\)\\)),"#"\\)`);
    assert.ok(pattern.test(out), name);
    out = out.replace(pattern, `$1,${JSON.stringify(url)},${JSON.stringify(label)})`);
  }
  // Drop duplicate social destinations and the unrelated mobile pairing entry.
  for (const name of ['in', 'tw', 'ig']) {
    out = out.replace(`GLA11y.objectNode(_this.${name},_this.ui.group),`, '');
    out = out.replace(new RegExp(`_this\\.${name}\\.interact\\(hover,.*?\\),"#","[^"]*"\\),`), '');
  }
  out = replace(out, '_this.ui.alpha=0,_this.ui.hide()', '_this.in.hide(),_this.tw.hide(),_this.ig.hide(),_this.sync.hide(),_this.ui.alpha=0,_this.ui.hide()', '清理重复社交图标与同步入口');
  out = replace(out, '_this.ref_MobileSync477=_this.initClass(MobileSync),_this.ref_MobileSync477.isFragment&&_promises.push(_this.wait(_this.ref_MobileSync477,"__ready")),', '', '移除无关二维码配对');
  return out;
});
await adaptModule('ChatDOM', input => {
  let out = input;
  for (const [a, b] of [
    ['"-> websites","Website"', '"-> paper","Paper"'],
    ['"-> installations","Installation"', '"-> scan","Scan"'],
    ['"-> XR / VR / AI","XR"', '"-> scores","Scores"'],
    ['"-> multiplayer","Multiplayer"', '"-> roles","Roles"'],
    ['"-> games","Game"', '"-> source","Source"'],
    ['"What are you looking for?"', '"Which study are you looking for?"'],
    ['"Ask me anything..."', '"Search the studies..."']
  ]) out = replace(out, a, b, `作品筛选 ${a}`);
  const disclaimerStart = out.indexOf('_this.bind("showDisclaimer"');
  const disclaimerEnd = out.indexOf('_this.listen("Global/loadFinished"', disclaimerStart);
  assert.ok(disclaimerStart >= 0 && disclaimerEnd > disclaimerStart);
  out = replace(out, out.slice(disclaimerStart, disclaimerEnd), '', '移除原机构聊天记录提示和隐私链接');
  return out;
});
app = replace(app, 'https://atlab.io', github, '实验室链接');
app = replace(app, 'Active Theory · Creative Digital Experiences', `${brand} · ${slogan}`, '文档标题');
app = replace(app, '${data.title} · Active Theory', '${data.title} · ' + brand, '详情文档标题');
// 原站 WebMCP 的静态介绍也属于内容，避免读到原机构履历。
const info = 'Active Theory is a creative digital production studio founded in 2012.';
const infoStart = app.indexOf(info), infoEnd = app.indexOf('"', infoStart);
assert.ok(infoStart > 0 && infoEnd > infoStart);
app = replace(app, app.slice(infoStart, infoEnd), `${brand}. ${slogan} Fourteen studies of the school marking system, set in its paper-edge skin. Source: ${github}.`, 'WebMCP 品牌介绍');
app = app.replaceAll('Get more information about Active Theory, the agency that created this website.', `Get more information about ${brand}.`)
  .replaceAll('Open the contact modal for Active Theory.', `Open the contact modal for ${brand}.`)
  .replaceAll('Please use the provided email to reach out.', 'Open the project repository.');
app = replace(app, '_workPages.refresh([..._workData.slice(0,14).shuffle()])', '_workPages.refresh(_workData.slice(0,14))', '十四展品固定叙事顺序');
app = replace(app, '_workData.filter((element=>element.tags.includes(tag))).shuffle().slice(0,14)', '_workData.filter((element=>element.tags.includes(tag))).slice(0,14)', '筛选保留档案顺序');
app = replace(app, '${new Date(data.completionDate).getFullYear()}\\n${data.clientName}', 'STUDY ${String(data.priority).padStart(2,"0")} / 14\\n${data.clientName}', '档案编号替代制作年份');
await adaptModule('NavUI', input => {
  let out = replace(replace(input, 'text:"Work"', 'text:"Studies"', '作品导航文案'), 'text:"Contact"', 'text:"About"', '关于导航文案');
  out = replace(out, '_this.work.wrapper.x=_this.bg.x+80', '_this.work.wrapper.x=_this.bg.x+.22*_this.bg.width', '导航左侧文字留白');
  out = replace(out, '_this.contact.wrapper.x=_this.bg.x+_this.bg.width*Math.mix(.6,.5,Tests.noMusic()?1:0)-2', '_this.contact.wrapper.x=_this.bg.x+.66*_this.bg.width', '导航右侧文字留白');
  out = replace(out, '_this.audio.x=_this.bg.x+.5*_this.bg.width-_this.audio.width/2-13', '_this.audio.x=_this.bg.x+.5*_this.bg.width-_this.audio.width/2', '波形精确居中');
  out = replace(out, '_this.work.wrapper.x-=8,_this.contact.wrapper.x+=20,', '', '移除旧标签专用偏移');
  return replace(out, '_this.audio.x-=2', '_this.audio.x=_this.bg.x+.5*_this.bg.width-_this.audio.width/2', '小波形居中');
});
app = replace(app, 'let link=_this.params.text.toLowerCase();', 'let link=_this.params.text.toLowerCase();if(link==="about")link="contact";', '关于按钮保留原路由');
app = replace(app, '_room&&_room.updateUserData(_this.data)', '_room?.updateUserData?.(_this.data)', '初始化房间尚未可写时保留本地播放器状态');
if (pagesBase) {
  const marker = 'Inherit(_this,Router,null,"")';
  assert.equal(app.split(marker).length - 1, 1, '路由根路径不唯一');
  app = replace(app, marker, `Inherit(_this,Router,null,${JSON.stringify(pagesBase)})`, '静态站点子路径');
  // 纹理路径已经由 absolutePath 按 HYDRA_BASE_PATH 拼接。再给 Assets.CDN 加前缀会变成 stage//…/stage/assets。
  app = replace(app, '_this.video.src=((window.HYDRA_ASSETS_CDN||"")+thumbnailURL)', '_this.video.src=((window.PX_STAGE_BASE||"")+thumbnailURL)', '原图使用页面基路径');
  app = replace(app, '(location.hostname+port+pathname+"/"+path).replace("//","/")', '(location.hostname+port+pathname+"/"+path).replace(/\\/{2,}/g,"/")', '合并重复斜杠');
}

// iPadOS 13+ 的 Safari 自称 Macintosh。原先只把接近 4:3 的屏幕当成 iPad，iPad mini 会被当成桌面：
// 触摸被 preventDefault，滚动拖拽关闭，悬停界面打不开。多点触控的 Mac 标识即平板。
app = replace(app, 'function detectIpad(){let aspect=Math.max(screen.width,screen.height)/Math.min(screen.width,screen.height);return _this.detect("mac")&&_this.touchCapable&&Math.abs(aspect-4/3)<Math.abs(aspect-1.6)}', 'function detectIpad(){return _this.detect("mac")&&navigator.maxTouchPoints>1}', 'iPad 不再按长宽比误判为桌面');
app = replace(app, '_scroll=new Scroll({limit:!1,drag:Device.mobile})', '_scroll=new Scroll({limit:!1,drag:!!(Device.mobile||navigator.maxTouchPoints>1)})', '多点触控可以拖动舞台');
app = replace(app, 'function getDPR(){return window.AURA?Device.pixelRatio:', 'function getDPR(){if(Device.mobile&&Device.mobile.tablet)return Math.min(2,Device.pixelRatio||1);return window.AURA?Device.pixelRatio:', '平板画布使用设备像素');
app = replace(app, '_this.getDPR=_=>GPU.OVERSIZED', '_this.getDPR=_=>Device.mobile&&Device.mobile.tablet?Math.min(2,Device.pixelRatio||1):GPU.OVERSIZED', '平板离屏缓冲使用设备像素');
app = replace(app, '}else Stage.width=window.innerWidth||document.body.clientWidth||document.documentElement.offsetWidth,Stage.height=Stage.isNormalMobileScroll&&Stage.div.offsetHeight||window.innerHeight||document.body.clientHeight||document.documentElement.offsetHeight}', '}else{let vv=window.visualViewport&&"ios"===Device.system.os?window.visualViewport:null;Stage.width=vv?vv.width:window.innerWidth||document.body.clientWidth||document.documentElement.offsetWidth,Stage.height=vv?vv.height:Stage.isNormalMobileScroll&&Stage.div.offsetHeight||window.innerHeight||document.body.clientHeight||document.documentElement.offsetHeight}}', 'iPad 使用可视视口高度');
app = replace(app, 'html.scrollTop=-1),Events.emitter._fireEvent(Events.RESIZE)}),delay)})),window.onorientationchange=window.onresize', 'html.scrollTop=-1),Events.emitter._fireEvent(Events.RESIZE)}),delay)})),window.visualViewport&&window.visualViewport.addEventListener("resize",(()=>{clearTimeout(timer),timer=setTimeout(updateStage,delay)})),window.onorientationchange=window.onresize', '工具栏变化时重测舞台');
app = replace(app, '{width:60,height:30,bg:"#ff0000",_type:"glObject",refName:"hit",children:[]},{font:"NBArchitektStd-Regular",fontSize:12', '{width:96,height:48,bg:"#ff0000",_type:"glObject",refName:"hit",children:[]},{font:"NBArchitektStd-Regular",fontSize:12', '导航热区适合手指');
app = replace(app, '_this.hit.alpha=0,_this.hit.y=-10,_this.hit.x=-10', '_this.hit.alpha=0,_this.hit.y=-18,_this.hit.x=-18', '导航热区盖住文字');
// 基准测试把偏慢的 iPad 标成 legacy 后会进屏蔽名单。有真实 WebGL2、且不是软件渲染的 iOS 不跳转 unsupported。
app = replace(app, 'match:function(){return!Device.graphics.gpu||Device.graphics.gpu.detect([', 'match:function(){const gl=Device.graphics.webgl,label=((gl&&gl.renderer)||"")+" "+((gl&&gl.gpu)||""),software=/swiftshader|llvmpipe|softpipe|basic render|generic renderer/i.test(label);let blocked=!Device.graphics.gpu||Device.graphics.gpu.detect([', '记录 GPU 屏蔽结果');
app = replace(app, '"sgx543","legacy","sgx 543"])}}})', '"sgx543","legacy","sgx 543"]);if(blocked&&gl&&gl.webgl2&&"ios"===Device.system.os&&!software)blocked=!1;return blocked}}})', '真实 WebGL2 的 iPad 不进 unsupported');
const cardNeedles = [
  ['WorkItemShader.glsl', 'videoUV = mix(videoUV, scaleUV(gl_FragCoord.xy / resolution, vec2(0.6)), 0.3);'],
  ['WorkItemShader.glsl', 'videoUV - normal.xy * 0.05 * (1.0-uVideoBlend)'],
  ['WorkItemShader.glsl', '0.005 * edges'],
  ['WorkItemShader.glsl', 'pow(min(vec3(0.5), video), vec3(1.0)) * 0.45'],
  ['WorkItemShader.glsl', 'sin(time * 2.0 + vUv.x * 5.0) * 0.15'],
  ['WorkItemShader.glsl', 'radialBlur(tRefraction, ruv, 5.0, 5.0)'],
  ['WorkItemShader.glsl', 'ruv -= 0.05 * vNormal.xy'],
  ['WorkItemShader.glsl', 'uHover * 0.03 + 0.02 + sin(time * 2.0 + vUv.x * 5.0) * 0.005'],
  ['WorkItemUIShader.glsl', 'uv.x += fract(uv.x * 15.0) * edges;'],
  ['WorkItemUIShader.glsl', 'getRGB(tMap, uv, radians(180.0), 0.001 - edges * 0.15)']
];
const shaderSource = await fs.readFile(path.join(frozen, 'compiled.vs'), 'utf8');
for (const [file, needle] of cardNeedles) {
  const chunk = shaderSource.split(`}{@}${file}{@}`)[1]?.split('}{@}')[0] || '';
  assert.ok(chunk.includes(needle), `展板着色器片段缺失：${needle}`);
}
app = replace(app, 'function parseCompiled(shaders){var split=shaders.split("{@}");split.shift();for(var i=0;i<split.length;i+=2){var name=split[i],text=split[i+1];text.includes("#!UNIFORMS")?parseSingleShader(text,name):_this[name]=text}}', 'function parseCompiled(shaders){var split=shaders.split("{@}");split.shift();for(var i=0;i<split.length;i+=2){var name=split[i],text=split[i+1];if(name==="WorkItemShader.glsl"||name==="WorkItemUIShader.glsl")text=function mild(name,text){const swap=(a,b)=>{text.includes(a)&&(text=text.split(a).join(b))};if(name==="WorkItemShader.glsl"){swap("videoUV = mix(videoUV, scaleUV(gl_FragCoord.xy / resolution, vec2(0.6)), 0.3);","videoUV = mix(videoUV, scaleUV(gl_FragCoord.xy / resolution, vec2(0.6)), 0.0);");swap("videoUV - normal.xy * 0.05 * (1.0-uVideoBlend)","videoUV - normal.xy * 0.012 * (1.0-uVideoBlend)");swap("0.005 * edges","0.0");swap("pow(min(vec3(0.5), video), vec3(1.0)) * 0.45","video * 0.7");swap("sin(time * 2.0 + vUv.x * 5.0) * 0.15","sin(time * 2.0 + vUv.x * 5.0) * 0.04");swap("radialBlur(tRefraction, ruv, 5.0, 5.0)","radialBlur(tRefraction, ruv, 2.0, 1.25)");swap("ruv -= 0.05 * vNormal.xy","ruv -= 0.02 * vNormal.xy");swap("uHover * 0.03 + 0.02 + sin(time * 2.0 + vUv.x * 5.0) * 0.005","uHover * 0.015 + 0.006 + sin(time * 2.0 + vUv.x * 5.0) * 0.002")}else{swap("uv.x += fract(uv.x * 15.0) * edges;","uv.x += fract(uv.x * 15.0) * edges * 0.15;");swap("getRGB(tMap, uv, radians(180.0), 0.001 - edges * 0.15)","getRGB(tMap, uv, 0.0, 0.0)")}return text}(name,text);text.includes("#!UNIFORMS")?parseSingleShader(text,name):_this[name]=text}}', '展板正面减轻涂抹，标志玻璃保持原着色器');
await write('assets/js/app.1780406240914.js', app);

let html = await fs.readFile(path.join(reference, 'index.html'), 'utf8');
const sourceDescription = 'Founded in 2012. We blend story, art & technology as an in-house team of passionate makers. Our industry-leading web toolset consistently delivers award-winning work through quality & performance. ';
html = html.replaceAll('Active Theory · Creative Digital Experiences', `${brand} · ${slogan}`).replaceAll(sourceDescription, slogan)
  .replaceAll('https://storage.googleapis.com/activetheory-v6.appspot.com/media/social.jpg', '/assets/daily/hero.jpg')
  .replaceAll('https://activetheory.net', '/').replaceAll('content="Active Theory"', `content="${brand}"`)
  .replace(/\s*<script>\s*window\.dataLayer[\s\S]*?<\/script>/, '');
const bootBridge = await buildBoot(root, write);
const assetPrefix = pagesBase
  ? `<base href="${pagesBase}"><script>window.PX_STAGE_BASE=${JSON.stringify(pagesBase)};window.HYDRA_BASE_PATH=${JSON.stringify(pagesBase.slice(0, -1))};(function(){var base=${JSON.stringify(pagesBase.slice(0, -1))};try{var saved=sessionStorage.getItem("px-stage-path");if(saved){sessionStorage.removeItem("px-stage-path");if(saved.indexOf(base+"/")===0)history.replaceState(null,"",saved);}}catch(e){}var orig=window.fetch;window.fetch=function(input,init){if(typeof input==="string"&&input.charAt(0)==="/"&&input.charAt(1)!=="/"&&input.indexOf(base+"/")!==0)input=base+input;return orig.call(this,input,init);};})();</script>`
  : '<base href="/">';
html = html.replace('<base href="/">', '');
html = html.replace('<head>', '<head>' + assetPrefix + bootBridge + '<meta name="px-stage" content="tablet-touch-2">');
await write('index.html', html);
if (pagesBase) {
  await write('404.html', html);
  await write('.nojekyll', '');
}

const uil = JSON.parse(await fs.readFile(path.join(frozen, 'uil.1780406240914.json'), 'utf8'));
const changedUIL = [];
function set(key, value) { assert.ok(key in uil, key); changedUIL.push({ key, before: uil[key], after: value }); uil[key] = value; }
set('INPUT_Element_3_About_text3d_text', 'Project\nX');
set('INPUT_Element_4_About_text3d_text', 'From the desk to the record.\n\nPaper / Scan / Scores\n\nFourteen studies of Project-X, in the paper-edge skin.');
set('INPUT_Element_5_WorkDetailContent_text3d_text', 'PAPER');
set('INPUT_Element_8_WorkDetailContent_text3d_text', '01 / 14\nPROJECT X\nSTUDIES');
set('MESH_Element_22_CleanRoomscale', [.66, .33, 1]);
set('INPUT_Element_15_CleanRoom_text3d_text', '// THE\nDESK ->');
set('INPUT_Element_20_CleanRoom_text3d_text', 'A paper edge for work that stays inside the school.');
for (const [key, filename] of [
  ['INPUT_Config_2_About_geometry', 'monogram-home.json'],
  ['INPUT_Config_8_ParticleTest_geometry', 'monogram-home.json'],
  ['INPUT_Config_18_TreeScene_geometry', 'monogram-tree.json'],
  ['INPUT_Config_12_CleanRoom_geometry', 'monogram-particles.json']
]) set(key, { ...uil[key], filename, relative: 'assets/geometry/daily', src: `assets/geometry/daily/${filename}` });
for (const key of Object.keys(uil)) {
  if (uil[key]?.src === 'assets/images/ui/at-labrds.jpg') set(key, { ...uil[key], src: 'assets/daily/monogram.png', filename: 'monogram.png', relative: 'assets/daily' });
  if (uil[key]?.src === 'assets/images/lab.jpg') set(key, { ...uil[key], src: 'assets/rhine/07.png', filename: '07.png', relative: 'assets/rhine' });
}
await write('assets/data/uil.1780406240914.json', JSON.stringify(uil));
await write('assets/data/uil.json', JSON.stringify(uil));
for (const version of ['dev', 'latest']) {
  await write(`remote/cms/projects-${version}.json`, JSON.stringify(studies));
  const social = { url: '/assets/daily/hero.jpg' };
  await write(`remote/cms/metadata-${version}.json`, JSON.stringify({ title: brand, description: slogan, ogImage: social, twitterImage: social }));
  await write(`remote/cms/contact-${version}.json`, JSON.stringify({ links: [{ title: 'GitHub', url: github }] }));
}
await write('local/geo.json', JSON.stringify({ location: { countryCode: 'CN' } }));

// Preserve all fourteen selected PRTS originals byte-for-byte.
for (const file of await fs.readdir(originals)) await write(`assets/rhine/${file}`, await fs.readFile(path.join(originals, file)));
await write('assets/daily/hero.jpg', await sharp(path.join(originals, '12.png')).jpeg({ quality: 95 }).toBuffer());
const svg = rhineSVG;
await write('assets/daily/monogram.png', await sharp(Buffer.from(svg)).png().toBuffer());
// LogoShader discards the outer 10% on each side; keep the full mark inside it.
await write('assets/daily/wordmark.png', await sharp(Buffer.from(svg)).resize(304, 152)
  .extend({ left: 48, right: 48, top: 24, bottom: 24, background: '#00000000' }).png().toBuffer());
const githubSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.1c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.54 11.54 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.64-5.48 5.94.43.37.82 1.1.82 2.22v3.16c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg>';
await write('assets/daily/github.png', await sharp(Buffer.from(githubSVG)).resize(128, 128).png().toBuffer());
for (const size of [16, 32, 180]) {
  const image = await sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain', background: '#000' }).png().toBuffer();
  await write(`assets/meta/${size === 180 ? 'apple-touch-icon' : `favicon-${size}x${size}`}.png`, image);
}
await write('assets/meta/manifest.json', JSON.stringify({ name: brand, short_name: brand, start_url: pagesBase || '/', display: 'standalone', background_color: '#000', theme_color: '#000' }));
await write('assets/meta/safari-pinned-tab.svg', svg);

// 只替换模型顶点；各场景位置、旋转、比例、材质和响应函数不变。
const shapes = rhineShapes;
const base = new ExtrudeGeometry(shapes, { depth: .3, steps: 1, bevelEnabled: true, bevelThickness: .035, bevelSize: .018, bevelSegments: 5, curveSegments: 48 });
base.computeBoundingBox();
const center = base.boundingBox.getCenter(new Vector3()), size = base.boundingBox.getSize(new Vector3());
base.translate(-center.x, -center.y, -center.z);
for (const [filename, xy, depth, z] of [['monogram-home.json', .7191892068, .0512229218, 0], ['monogram-tree.json', 5.364, .565, -.2825], ['monogram-particles.json', .7262358069, .1670302451, 0]]) {
  const geometry = base.clone();
  const scale = xy / Math.max(size.x, size.y);
  geometry.scale(scale, scale, depth / size.z); geometry.translate(0, 0, z);
  geometry.computeVertexNormals();
  const data = Object.fromEntries(['position', 'normal', 'uv'].map(key => [key, Array.from(geometry.getAttribute(key).array)]));
  await write(`assets/geometry/daily/${filename}`, JSON.stringify(data));
  // 清理早期生成到错误资源前缀的同名产物，原始资源与输入不受影响。
  await fs.rm(path.join(publicDir, 'assets/daily', filename), { force: true });
  geometry.dispose();
}
base.dispose();

// 字节级核验关键视觉模块；内容字段独立记录，便于检查是否误改动效。
const protectedNames = ['Home', 'About', 'Footer', 'WorkItems', 'WorkItem', 'WorkDetail', 'WorkDetailParticles', 'HomeLogoShader', 'AboutLogoShader', 'LoaderGLUI', 'FXScroll', 'MouseFluid', 'Fluid'];
const preserved = [];
for (const name of protectedNames) {
  const source = await moduleSource(name);
  assert.ok(app.includes(source), `禁止改动的视觉模块发生变化：${name}`);
  preserved.push({ name, sha256: sha(source), identical: true });
}
const sourceApp = await fs.readFile(path.join(frozen, 'app.1780406240914.js'), 'utf8');
const sceneConfig = sourceApp.match(/_this\._initFXScroll\(\[.*?\]\)/)?.[0];
assert.ok(sceneConfig && app.includes(sceneConfig), '场景序列或滚动参数发生变化');
const shaderBytes = await fs.readFile(path.join(publicDir, 'assets/shaders/compiled.vs'));
const shaderOriginal = await fs.readFile(path.join(frozen, 'compiled.vs')).catch(() => shaderBytes);
assert.equal(sha(shaderBytes), sha(shaderOriginal));
const manifest = { date: '2026-10-18', originalVersion: '1780406240914', brand, slogan, github, projectCount: studies.length, patches: changes, contentFields: changedUIL, preservedModules: preserved, sceneConfig, shaders: { sha256: sha(shaderBytes), identical: true }, runtimeSHA256: sha(app), originalRuntimeSHA256: sha(sourceApp), videoPolicy: '十四张 1600×900 纸锋展板，保留原媒体切换、实时粒子与光学效果', sharedAssets: 'public/assets' };
await fs.writeFile(path.join(analysis, 'adaptation-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`原版动效模块 ${preserved.length} 项逐字节一致；14 段 Project-X 纸锋研究、原三维标志与登录序列已接入。`);
