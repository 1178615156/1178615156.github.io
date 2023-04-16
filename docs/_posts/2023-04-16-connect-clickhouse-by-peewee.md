---
layout: post
title:  在peewee中连接clickhouse
---


### 在clickhouse中开启mysql连接方式
```xml
    <?xml version="1.0"?>
    <clickhouse>
        <!-- See also the files in users.d directory where the settings can be overridden. -->
        <mysql_port>9004</mysql_port>
    </clickhouse>
```

### peewee中配置mysql连接
使用`MySQLDatabase`驱动,需要将这两个参数配置成`False`,clickhouse不支持事务
```python
    MySQLDatabase.for_update = False
    MySQLDatabase.commit_select = False
```
之后就能正常使用peewee连clickhouse
### 加上`final` 修饰符
在使用`ReplacingMergeTree`的时候，有时候希望加上`final`来获取无重结果.
使用`from_`方法

```python
model
.select()
.from_(model._meta.table_name + " FINAL" ))
```
