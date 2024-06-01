---
layout: post
---


# 使用docker-maven镜像编译maven项目.md


### 通过命令行启动
```shell
docker run -it --rm --net host \
  -v $PWD:/app \
  -v /root/.m2:/root/.m2 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -w /app \
  maven \
    mvn -s settings.xml clean package "-Dmaven.test.skip=true"

```
