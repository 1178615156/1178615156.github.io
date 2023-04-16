---
layout: post
title:  "将wireguard的UDP数据包装成TCP"
---
wireguard(简称wg)是一款非常好用的VPN,wg是UDP来传输数据,但是有的时候防火墙可能对UDP数据包有限制,会drop掉所有的UDP数据包.


wg的官网上介绍了,wg本身不支持TCP,这种情况下需要能够把UDP数据包包装成TCP数据包才行.
##### [TCP Mode](https://www.wireguard.com/known-limitations/)

>WireGuard explicitly does not support tunneling over TCP, due to the classically terrible network performance of tunneling TCP-over-TCP. Rather, transforming WireGuard's UDP packets into TCP is the job of an upper layer of obfuscation (see previous point), and can be accomplished by projects like [udptunnel](https://github.com/rfc1036/udptunnel) and [udp2raw](https://github.com/wangyu-/udp2raw-tunnel).

官方页面上写了两个项目
- https://github.com/rfc1036/udptunnel
  这个项目作者没维护,而且在实际使用并不稳定,常常挂掉
- https://github.com/wangyu-/udp2raw-tunnel
  这个主要问题是需要修改`MTU`,由于wg默认的MTU是1420,如果wg已经正常运行使用了,修改`MTU`相对不是特别可取.
  > 不论你用udp2raw来加速kcptun还是vpn,为了稳定使用,都需要设置合理的MTU（在kcptun/vpn里设置，而不是在udp2raw里），建议把MTU设置成1200。client和server端都要设置。

---
最后自己用的:
[https://github.com/erebe/wstunnel](https://github.com/erebe/wstunnel)

-   服务端: `wstunnel -v --server --restrictTo 127.0.0.1:<wg端口> ws://0.0.0.0:1080`
  -   假设服务端使用端口1080
-   客户端：- `wstunnel -v --udp -L 51010:127.0.0.1:<wg端口> ws://<服务端IP>:1080`
  -   假设客户端使用端口51010
-   在把wg里的endpoint改成 127.0.0.1:51010
-   重启wg
