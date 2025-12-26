# 借助githubAction将docker镜像推送到aliyun镜像仓库

## 背景
通常可以通过翻墙的方式下载镜像,但是现在AI相关的docker镜像越来越大动辄10G,不得不换个方式去下载.

## 实现

1. 新建一个github`私有`仓库,创建文件: `.github/workflows/docker-image.yaml`,写入

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:

  cache:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        dockerfile:
          # 需要推送的镜像,这里添加
          # 如Dockerfile.ollama,只要写Dockerfile.的后缀
          - ollama
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
 
      - name: Login
        uses: docker/login-action@v3
        with:
          registry: registry.cn-hangzhou.aliyuncs.com
          # 阿里云镜像仓库:账号密码
          username: <账号>
          password: <密码>
 
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile.${{ matrix.dockerfile }}
          push: true
          platforms: linux/amd64
          tags: |
            <阿里云镜像仓库地址>/${{ matrix.dockerfile }}:latest
          # 示例:
          # registry.cn-hangzhou.aliyuncs.com/a1178615156/${{ matrix.dockerfile }}:latest
 ```

2. 在根目录下创建`Dockerfile.ollama`:

```dockerfile

FROM ollama/ollama

```
1. 这样action就会根据Dockerfile.ollama去拉去`ollama/ollama`并推送到个人的阿里云镜像

2. 最后在aliyun上的服务器pull并运行:
```shell
docker pull registry.cn-hangzhou.aliyuncs.com/a1178615156/ollama:latest
```