# 处理华为云堡垒机，在Xshell-7.0.0134之后的版本无法连接问题

### 背景
- 从华为云堡垒机上下载的xshell连接配置在xshell6和Xshell-7.0.0134
- xshell升级到最新的0151(只要大于134)版本都不能正常连接
- 连接会报错`连接出现异常，将返回上一页`
- 然后连接断开


### 方案
- 在xshell中右键属性，找到登录脚本
- 华为云堡垒机其实是登录之后发送一个登录命令(?192...)跳转到对应的服务器上去的，如：
![alt text](/assets/img/1712197394054.png)
- 修改登录命令，用?把命令括起来?如：
![alt text](/assets/img/1712197540412.png)
- 之后就能正常连接了。