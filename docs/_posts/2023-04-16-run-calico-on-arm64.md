---
layout: post
title:  ARM64机器上运行calico报ipset异常
---

## 问题排查

在K8S中运行calico-node异常:

```
calico-node pod failing to run: Bad return code from ipset list - Kernel error received: Invalid argument

```

### [](https://github.com/1178615156/pages/blob/gh-pages/note/%E5%9C%A8ARM%E6%9C%BA%E5%99%A8%E4%B8%8A%E8%BF%90%E8%A1%8Ccalico%E6%8A%A5ipset%E5%BC%82%E5%B8%B8.md#%E5%8F%AF%E8%83%BD%E7%9A%84%E5%8E%9F%E5%9B%A0)可能的原因

#### [](https://github.com/1178615156/pages/blob/gh-pages/note/%E5%9C%A8ARM%E6%9C%BA%E5%99%A8%E4%B8%8A%E8%BF%90%E8%A1%8Ccalico%E6%8A%A5ipset%E5%BC%82%E5%B8%B8.md#calico%E7%9A%84bug)calico的BUG

可以通过升级版本解决 [projectcalico/calico#5011](https://github.com/projectcalico/calico/issues/5011)

#### [](https://github.com/1178615156/pages/blob/gh-pages/note/%E5%9C%A8ARM%E6%9C%BA%E5%99%A8%E4%B8%8A%E8%BF%90%E8%A1%8Ccalico%E6%8A%A5ipset%E5%BC%82%E5%B8%B8.md#%E5%86%85%E6%A0%B8%E7%BC%BA%E5%B0%91%E4%BA%86ipset)内核缺少了ipset

在一些ARM机器上会这个问题,例如:

```
  Operating System: Ubuntu 18.04.5 LTS
            Kernel: Linux 4.9.201-tegra
      Architecture: arm64

```

这个安装ipset即可

安装ipset之前需要安装libmnl

```
git clone git://git.netfilter.org/libmnl.git
cd libmnl && ./autogen.sh && ./configure && make && make install && cd .. 

```

接着安装ipset

```source-shell
git clone git://git.netfilter.org/ipset.git
cd ipset
./autogen.sh
./configure 
make
make modules 
make install
make modules_install
depmod  -a

```

**检查ipset**正常应该无返回正常

```source-shell
ipset list 
```
