# 2025-12-18-使用ssh隧道在k8s的POD和IDC机房程序进行交互.md


## 背景
1. 客户提供了IDC机房中的服务器,但是只开放了SSH端口,拒绝开放其他端口(进和出都拒绝)
2. 所有需要一种方式能够在k8s通过ssh隧道访问到IDC机房中服务器上的程序/数据库

## 实现

```yaml
kind: Service
apiVersion: v1
metadata:
  name: idc-service-mysql
spec:
  type: NodePort
  ports:
    - port: 3306
      targetPort: 3306
  selector:
    app: idc-service

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: idc-service
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: idc-service
  template:
    metadata:
      labels:
        app: idc-service
    spec:
      containers:
        - name: mysql
          image: ringcentral/sshpass
          tty: true
          stdin: true
          command:
            - usr/bin/sshpass
            - -p
            - '<服务器的密码>'
            - /usr/bin/ssh
            - -L
            - 0.0.0.0:3306:127.0.0.1:3306
            - -p
            - '22'
            - -o
            - UserKnownHostsFile=/dev/null
            - -o
            - StrictHostKeyChecking=no
            - root@<服务器的IP>
```

1. 用ringcentral/sshpass将密码通过命令行传到ssh
2. 使用`-L`进行端口(3306)转发
3. 最后写一个service: `idc-service-mysql`,这样在k8s集群中就能直接访问到idc服务器上的mysql了