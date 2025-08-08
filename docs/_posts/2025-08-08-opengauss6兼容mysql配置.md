# 2025-08-08-opengauss6兼容mysql配置


1. 使用Docker-compose启动数据库,先写`docker-compose.yaml`
```
services:
  opengauss:
    image: enmotech/opengauss:6.0.0
    restart: always
    privileged: true
    container_name: opengauss
    ports:
      - 5432:5432
    environment:
      GS_PASSWORD: yujieshui@WORKED@996
    volumes:
      - ./init-mysql:/init-mysql
      - ./init-opengauss-dolphin:/docker-entrypoint-initdb.d
      - ./opengauss:/var/lib/opengauss/data

```

2. 把mysql的创建表的语句放到`init-mysql`文件夹下
3. 创建文件夹`init-opengauss-dolphin`,在文件夹下创建文件`0-init-db.sh`:

```bash

# 设置数据库连接参数
DB_USER="omm"
SQL_DIR="/init-mysql"
DB_NAME="<改这里mysql的数据库名>"

# 启动dolphin
gsql -r -v ON_ERROR_STOP=1 --username omm --password "$GS_DB" <<- EOF
create database $DB_NAME with DBCOMPATIBILITY='B';
alter system set enable_dolphin_proto= on;
alter system set dolphin_server_port=3307;
EOF

# 按数字顺序执行所有 SQL 文件
for sql_file in $(ls $SQL_DIR/[0-9]*.sql | sort); do
    echo "Executing $sql_file..."
    gsql -r -v ON_ERROR_STOP=1 --username "$DB_USER" --password "$GS_DB" --dbname "$DB_NAME" -f "$sql_file"
    if [ $? -ne 0 ]; then
        echo "Error executing $sql_file"
        exit 1
    fi
done
```