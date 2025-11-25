---
layout: post
---

# 2025-11-25-tcp-over-http-proxy
有时候客户的出口必须走http-proxy,但是一些service服务是TCP的需要想办法绕开限制．



### 1.socat
socat最简单,临时测试下没啥大问题,但是没有心跳保持和断线重连.

```
socat TCP-LISTEN:<本地端口>,fork PROXY:<http-proxy-ip>:<服务端IP:端口>,proxyport=<http-proxy-port>

# 例如
socat TCP-LISTEN:8080,fork PROXY:192.168.1.1:8.8.8.8:443,proxyport=1080

```




### 2.wstunnel
wstunnel会先创建webscoket连接到服务端,之后将本地端口的流量转发到服务端,这个向基本的心跳/重连都有可用性好很多.
https://github.com/erebe/wstunnel


service
```
# 监听本地1080端口,并把流量转发到127.0.0.1:80

wstunnel server --log-lvl DEBUG --restrict-to 127.0.0.1:80 wss://0.0.0.0:1080
```

client:
```
# 监听并把流量转到服务器上的(127.0.0.1:80-这个和service的restrict-to一致)
wstunnel client -L 'tcp://0.0.0.0:1080:127.0.0.1:80' ws://<服务器上wstunnel的IP:端口>
```