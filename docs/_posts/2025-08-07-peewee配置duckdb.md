# 2025-08-07-peewee配置duckdb

### 1. 实现DuckDatabase
```python
class DuckDatabase(SqliteDatabase):
    def __init__(self, database, *args, **kwargs):
        self._pragmas = kwargs.pop('pragmas', ())
        super(SqliteDatabase, self).__init__(database, *args, **kwargs)
        self._aggregates = {}
        self._collations = {}
        self._functions = {}
        self._window_functions = {}
        self._table_functions = []
        self._extensions = set()
        self._attached = {}
        self.nulls_ordering = self.server_version >= (3, 30, 0)
        self._connect_readonly=False

    def _connect(self):
        import duckdb
        conn = duckdb.connect(self.database,read_only=self._connect_readonly)
        try:
            self._add_conn_hooks(conn)
        except:
            conn.close()
            raise
        return conn
database_duckdb = DuckDatabase("<duckdb文件路径>")
```
### 2. 替换数据类型
```python
class BigIntegerField(peewee.IntegerField):
    field_type = 'INT8'


class IntegerField(peewee.IntegerField):
    field_type = 'INT8'


class TextField(peewee.TextField):
    field_type = 'TEXT'


class CharField(peewee.TextField):
    field_type = 'TEXT'

```

### 3. 定义自己的model
```python
class MyModel(DuckdbModel):
    id = BigIntegerField(primary_key=True)
    ...
    class Meta:
        database = database_duckdb
        legacy_table_names = False

```
