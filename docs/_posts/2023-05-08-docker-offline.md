# docker离线版


## centos:7
### 1. 借助docker运行一个干净的centos环境

```bash
docker run -t -i --rm -v $(pwd)/docker-rpm:/docker-rpm --privileged=true centos
```

### 2. 进入容器之后执行下列命令下载docker和其依赖的rpm包
```bash
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum makecache
yum install --downloadonly --downloaddir=/docker-rpm/ \
    docker-ce docker-ce-cli containerd.io \
    device-mapper-persistent-data lvm2 
exit
```

## openEuler:20



## 安装,所有的rpm包都在`./docker-rpm`里了
```
rpm -ivhU *.rpm  --nodeps --force
```

sed -i 's/\$releasever/8/g' /etc/yum.repos.d/docker-ce.repo

