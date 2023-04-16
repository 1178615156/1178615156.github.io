---
layout: post
title:  在docker容器中运行VPN，中宇万通的TrustMore
---
由于一些缘故,不得不在服务器上运行中宇万通的VPN.

### 观察
首先中宇万通给的VPN的目录大概是这样:
```
linux_client
linux_client_daemon
start-client.sh
```
启动命令:
```
sh start-client.sh -addr <IP:PORT> -t 0 -u <UER_NAME> -p "<PASSWORD>"
```
仔细观察下会发现这个VPN其实是先启动`linux_client`然后监控`8001`端口,在用`iptables`把流量转发到`linux_client`程序上的,可以执行`iptables -L -n  -t nat`查看
```
Chain TRUSTMORE (2 references)
target     prot opt source               destination         
ACCEPT     tcp  --  0.0.0.0/0            <HIDE>      tcp dpt:443
REDIRECT   tcp  --  0.0.0.0/0            <HIDE>         tcp dpt:<HIDE> redir ports 8001
```
之后就可以访问对方在VPN提供的服务器如:`<target_ip>:<target_port>`.   
但是这个服务只能在安装了VPN的服务器上面访问,而VPN有是单点登录.  
为此需要再启动个`nginx`来将对方的服务器暴露出来.

---
### 实践
先写个`nginx.conf`配置,和VPN程序放在一起
```
worker_processes 4;

events {
    use epoll;
    worker_connections  65535;
}

stream {
    server {
        listen 996;
        proxy_connect_timeout 10s;
        proxy_timeout 60s;
        proxy_pass <target_ip>:<target_port>;
    }
}
```
让我们来写个`Dockerfile`
```Dockerfile
FROM centos:7

# 加入nginx源
RUN rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
# 安装iptables,VPN是用iptables来转发流量的
RUN yum install -y iptables 
# 以及一堆依赖
RUN yum install -y net-tools  pciutils dmidecode hdparm
# 然后自然是安装nginx
RUN yum install -y nginx
RUN systemctl enable nginx
# 把VPN程序复制进容器
COPY . /vpn
WORKDIR vpn

RUN chmod +777 linux_client && chmod +777 start-client.sh
# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf


CMD  nginx && exec sh start-client.sh -addr <VPN_IP:VPN_PORT> -t 0 -u <UER_NAME> -p "<PASSWORD>"
```
最后完整的目录结构就是这样
```
Dockerfile
linux_client
linux_client_daemon
nginx.conf
start-client.sh
```
最后打包运行
```
docker build -t proxy-vpn .
docker run -it -p 996:996 proxy-vpn
```
