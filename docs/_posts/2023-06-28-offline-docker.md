---
layout: post
date:   2023-06-29
title:  "离线安装docker"
---



## openeuler
```bash
docker run -it --rm -v /root/docker:/docker -w /docker openeuler/openeuler:22.03

cat << 'EOF' > /etc/yum.repos.d/docker.repo
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/8/$basearch/stable
enabled=1
gpgcheck=0
EOF

# docker version 
DOCKERVERSION=
yum install --downloadonly --downloaddir=. \
    docker-ce$DOCKERVERSION \
    docker-ce-cli$DOCKERVERSION \
    containerd.io$CONTAINERDVERSION \
    docker-buildx-plugin docker-compose-plugin \
    curl wget telnet iptables xfsprogs

exit
```
- 退出之后所有的rpm包都在`/root/docker`里了
- 安装 `rpm -ivhU *.rpm  --nodeps --force`

### centos7

```bash
docker run -it --rm -v /root/docker:/docker -w /docker centos:7

yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum makecache
yum install --downloadonly --downloaddir=/docker/ docker-ce docker-ce-cli containerd.io
exit
```
- 退出之后所有的rpm包都在`/root/docker`里了
- 安装 `rpm -ivhU *.rpm  --nodeps --force`

