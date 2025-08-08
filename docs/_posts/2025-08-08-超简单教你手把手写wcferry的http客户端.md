# 超简单教你手把手写wcferry的http客户端

1. 首先安装微信:3.9.12.51
2. 微信历史版本可以在这里下载:https://github.com/tom-snow/wechat-windows-versions
3. 接着安装Python基础依赖:

```bash
pip install wcferry==39.5.1.0 loguru fastapi[standard] pydantic
```

4. 写Python代码,保存到`weixin.py`中:

```python
import base64
import os
import threading
import time
import uuid
from pathlib import Path
from queue import Empty
from typing import Optional

from fastapi import FastAPI
from loguru import logger
from pydantic import BaseModel
from wcferry import Wcf

app = FastAPI()
wcf = Wcf()
current_dir = os.getcwd()
download_dir = os.path.join(current_dir, "download")
send_img_dir = os.path.join(current_dir, "send_img")
Path(download_dir).mkdir(exist_ok=True)
Path(send_img_dir).mkdir(exist_ok=True)


def file_to_base64(file_path):
    with open(file_path, 'rb') as file:
        file_content = file.read()
        base64_encoded = base64.b64encode(file_content)
        return base64_encoded.decode('utf-8')


def base64_to_file(base64_str, output_file_path):
    file_data = base64.b64decode(base64_str)
    with open(output_file_path, 'wb') as file:
        file.write(file_data)


class SendMsgModel(BaseModel):
    receiver: Optional[str] = None
    msg: Optional[str] = None
    image_base64: Optional[str] = None


@app.get('/wcf/get_user_info')
def get_user_info():
    """获取登录账号个人信息"""
    return wcf.get_user_info()


@app.get('/wcf/get_contacts')
def get_contacts():
    """获取完整通讯录"""
    return wcf.get_contacts()


@app.get('/wcf/get_msg')
def get_msg():
    """
    获取消息,可以一直轮询这个接口获取实时消息
     - image_base64: 是把图片下载后转成base64返回
    """
    try:
        msg = wcf.get_msg(block=False)
        if msg.type == 3:
            img_file = wcf.download_image(id=msg.id, extra=msg.extra, dir=download_dir)
            return {**msg.__dict__,
                    'image_name': os.path.basename(img_file),
                    'image_base64': file_to_base64(img_file)}
        return {**msg.__dict__}
    except Empty as e:
        pass
    except Exception as e:
        if e:
            logger.exception(e)
    return {}


@app.post('/wcf/send_text')
def send_msg(model: SendMsgModel):
    status = wcf.send_text(
        msg=model.msg,
        receiver=model.receiver
    )
    logger.info(f'msg:{model.msg}, receive:{model.receiver}, status:{status}')
    return {
        'status': status
    }


@app.post('/wcf/send_img')
def send_img(model: SendMsgModel):
    """
     - image_base64: base64后的图片,方便别的程序调用,直接通过接口就能传图片
    """
    file_name = os.path.join(send_img_dir, str(uuid.uuid4()))
    base64_to_file(
        base64_str=model.image_base64,
        output_file_path=file_name
    )
    status = wcf.send_image(
        path=file_name,
        receiver=model.receiver
    )
    logger.info(f'file:{file_name}, receive:{model.receiver}, status:{status}')
    return {
        'status': status
    }


def run_fast_api():
    import os
    import uvicorn
    uvicorn.run(app,
                host="0.0.0.0",
                port=int(os.environ.get("APP_PORT", 5000)),
                access_log=str(os.environ.get('APP_ACCESS_LOG', True)).lower() == 'true')


fast_api_thread = threading.Thread(daemon=True, target=run_fast_api)

if __name__ == '__main__':
    logger.info(f"user info: {wcf.get_user_info()}")
    fast_api_thread.start()
    wcf.enable_receiving_msg()
    try:
        while True:
            time.sleep(1.)
            if not wcf.is_login():
                wcf.cleanup()
    except Exception as e:
        wcf.cleanup()

```
4. 启动`python weixin.py`
5. 测试浏览器里访问,获取通讯录:`http://localhost:5000/wcf/get_contacts`
6. 测试浏览器里访问,获取消息:`http://localhost:5000/wcf/get_msg`
   
