### 背景
- 有些特殊情况下, 服务器只允许通过HTTP代理访问网络, 禁止任何直连操作.
- 这样会为后续的运维造成巨大的麻烦, 为此需要一些方法能够绕开限制.

### 实现
- 基本原理是使用这个类库[wstunnel](https://github.com/erebe/wstunnel)
- 这是一个能把tcp/udp包装成websocket数据包进行传递的程序

#### service
启动`wstunnel`绑定1080端口,把流量转化到wireguard的端口(51820)上
```bash
wstunnel -v --server  --restrictTo 127.0.0.1:51820 ws://0.0.0.0:443
```
#### client
```bash
wstunnel \
   -v --udp -L 51821:127.0.0.1:51820 \
   -p <http_proxy> \
   ws://<服务端的IP>:443
```
在修改wireguard总配置的endpoint为`127.0.0.1:51821`

### 最后
- 启动`wireguard`就能在服务器上通过vpn的IP远程到客户端了
- 注意http_proxy一般是不会保持长连接的,需要配置心跳否则会失联,在wireguard可以配置`PersistentKeepalive = 17`来保持连接