<p align="center">
  <img src="./src/assets/images/logo.png" width="50px" />
</p>

<p align="center">
  <span style="color: #42c02e">知行笔记</span> - 内容管理系统开源前端
</p>

系统预览：[ZXNOTE](https://zxctb.top:9090/notebook)  
详细文档：[DOCUMENT](./test.numbers)  

### 简介
  
支持新增、重命名和删除笔记分类；  
支持新增、删除笔记和移动笔记至其他分类；  
笔记标题、内容修改实时（延时 800ms）保存，支持 ctrl+s （command+s）、ctrl+z（command+z）、 ctrl+shift+z（command+shift+z）等常用快捷键；  
支持 Markdown 语法，LaTeX 语法，支持上传本地图片；  
支持切换预览模式，一边编辑笔记内容一边查看笔记预览；  
支持恢复笔记到某个历史版本，也支持在回收站中找回笔记；    
……

### 快速开始

**初始化安装依赖**

```
pnpm install
```

**在开发环境运行**

```
pnpm run dev
```

**打包到生产环境**

```
pnpm run build
```

**启动后端服务**  

开源后端：[zxnote-api](https://github.com/xtthaop/zxnote-api)  

初始账号：admin  
初始密码：111111

### 关于作者
ZXNOTE 的作者是一名前端小学生，水平不高，文档或者代码中如有不当之处还请指正。

### 成为赞助者
<img src="https://github.com/xtthaop/image-lib/blob/master/comodo-admin/sponsor.png?raw=true" width="300px" />

维护这个项目需要一定的服务器费用用作项目预览，还需要消耗我本人一定的精力，所以如果这个项目帮助到你的话，请多多予以支持！感谢！

### 许可证
[MIT](LICENSE.md)