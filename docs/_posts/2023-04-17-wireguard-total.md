---
layout: post
title:  wireguard汇总
date: 2023-04-17
comments: true
---
[wireguard](https://www.wireguard.com/quickstart/)是一个好用的VPN,基本介绍略,汇总下遇到的问题

## docker运行(无需安装kmod-wireguard)
安装wireguard需要升级许多依赖,有时候环境不允许升级,可以用[wireguard-go]来运行

```bash
# 运行
docker run -it --privileged --network host --name vpn-wg0 -d --restart always -v /etc/wireguard:/etc/wireguard --cap-add=NET_ADMIN masipcat/wireguard-go

# 看log
docker logs vpn-wg0
# 看状态
docker exec -it vpn-wg0 wg

```
---

## route

wireguard可以像这样配置路由功能.
```
[Interface]
Address = 172.23.0.1/16

```
[windows 启用 ip routing](https://serverfault.com/questions/929081/how-can-i-enable-packet-forwarding-on-windows)
```bat
reg add HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters /v IPEnableRouter /D 1 /f
```
```powershell
Set-NetIPInterface -Forwarding Enabled
```


---

## 将wireguard的UDP数据包装成TCP
wg是UDP来传输数据,但是有的时候防火墙可能对UDP数据包有限制,会drop掉所有的UDP数据包.

wg的官网上介绍了,wg本身不支持TCP,这种情况下需要能够把UDP数据包包装成TCP数据包才行.
##### [TCP Mode](https://www.wireguard.com/known-limitations/)

>WireGuard explicitly does not support tunneling over TCP, due to the classically terrible network performance of tunneling TCP-over-TCP. Rather, transforming WireGuard's UDP packets into TCP is the job of an upper layer of obfuscation (see previous point), and can be accomplished by projects like [udptunnel](https://github.com/rfc1036/udptunnel) and [udp2raw](https://github.com/wangyu-/udp2raw-tunnel).

官方页面上写了两个项目
- https://github.com/rfc1036/udptunnel
  这个项目作者没维护,而且在实际使用并不稳定,常常挂掉
- https://github.com/wangyu-/udp2raw-tunnel
  这个主要问题是需要修改`MTU`,由于wg默认的MTU是1420,如果wg已经正常运行使用了,修改`MTU`不太可行.
  > 不论你用udp2raw来加速kcptun还是vpn,为了稳定使用,都需要设置合理的MTU（在kcptun/vpn里设置，而不是在udp2raw里），建议把MTU设置成1200。client和server端都要设置。

---
最后自己用的:
[wstunnel](https://github.com/erebe/wstunnel)

-   服务端: `wstunnel -v --server --restrictTo 127.0.0.1:<wg端口> ws://0.0.0.0:1080`
  -   假设服务端使用端口1080
-   客户端：- `wstunnel -v --udp -L 51010:127.0.0.1:<wg端口> ws://<服务端IP>:1080`
  -   假设客户端使用端口51010
-   在把wg里的endpoint改成 127.0.0.1:51010
-   重启wg


---
## 将wireguard的流量走http-proxy


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
