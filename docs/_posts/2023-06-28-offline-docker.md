---
layout: post
date:   2023-06-28
title:  "离线安装docker(openeuler)"
---



```
docker run -it --rm -v ./docker:/docker -w /docker openeuler/openeuler:22.03

cat << 'EOF' > /etc/yum.repos.d/docker.repo
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/8/$basearch/stable
enabled=1
gpgcheck=0
EOF

yum install --downloadonly --downloaddir=. \
    docker-ce$DOCKERVERSION \
    docker-ce-cli$DOCKERVERSION \
    containerd.io$CONTAINERDVERSION \
    docker-buildx-plugin docker-compose-plugin \
    curl wget telnet iptables xfsprogs


```

