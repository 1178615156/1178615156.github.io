---
layout: post
title:  "如何让minio的python客户端每次sign结果一致"
date:   2023-04-01
---

## 背景
由于对于同一个文件minio每次签名生成的url的参数都不一致,会导致浏览器不能正常的缓存文件,每次都要重新请求.

## 实现

```python
client.presigned_get_object(
                    bucket_name=bucket,
                    object_name=url,
                    expires=datetime.timedelta(days=5),
                    request_date=datetime.datetime(now.year, now.month, now.day))
```

## 原理
- 之所以每次生成的参数都不一致,是因为签名中有`request_date`这个默认是当前的时间`time.utcnow()`
- 所以只要是这个参数不变就可以保证每次签名结果一直
