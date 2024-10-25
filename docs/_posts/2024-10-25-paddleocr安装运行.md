---
layout: post
---

# 2024-10-25-paddleocr安装运行


## 背景
`paddleocr`小版本运行问题超级多，找个能用的版本也不容易，感觉官方完全没测试就发布。。。

## paddleocr-v2.9.1

- 实际测试可以跟`paddlepaddle==3.0.0b1`一起使用
- 项目的`requirements.txt`中依赖，在服务器上运行可以使用`opencv-contrib-python-headless`，避免图像依赖。
```
shapely
scikit-image
imgaug
pyclipper
lmdb
tqdm
numpy<2.0
rapidfuzz
opencv-contrib-python-headless
cython
Pillow
pyyaml
requests
albumentations==1.4.10
albucore==0.0.13
```
- 使用了但没写在`requirements.txt`
```
python-docx
lxml
beautifulsoup4
```
- 安装使用需要配合`no-deps`
```
pip install --no-deps paddleocr==2.9.1
```

### 最后提供一个Dockerfile
```Dockerfile
FROM alpine AS download
WORKDIR /download

RUN wget https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_server_infer.tar && \
    tar -xvf ch_PP-OCRv4_det_server_infer.tar && \
    rm ch_PP-OCRv4_det_server_infer.tar
RUN wget https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_server_infer.tar && \
    tar -xvf ch_PP-OCRv4_rec_server_infer.tar && \
    rm ch_PP-OCRv4_rec_server_infer.tar


## paddleocr
FROM python:3.11-slim-bullseye

RUN apt-get -yqq update && \
    apt-get install -yq --no-install-recommends libgomp1 && \
    rm -rf /var/lib/apt/lists/* /var/tmp/* /tmp/*

RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# CPU版本，GPU需要自行替换version和idnex-url
RUN pip install --no-cache-dir --no-compile \
        paddlepaddle==3.0.0b1

RUN pip install --no-cache-dir --no-compile \
        shapely \
        scikit-image \
        imgaug \
        pyclipper \
        lmdb \
        tqdm \
        'numpy<2.0' \
        rapidfuzz \
        opencv-contrib-python-headless \
        cython \
        Pillow \
        pyyaml \
        requests \
        albumentations==1.4.10 \
        albucore==0.0.13 \
        python-docx \
        lxml \
        beautifulsoup4

RUN pip install --no-cache-dir --no-compile --no-deps \
        paddleocr==2.9.1

# 下载参数文件,当然不下载paddle启动的时候也会自动下载。
# 使用方式：PaddleOCR(ocr_version='PP-OCRv4',
#                    det_model_dir="/root/.paddleocr/ch_PP-OCRv4_det_server_infer",
#                    rec_model_dir="/root/.paddleocr/ch_PP-OCRv4_rec_server_infer")
COPY --from=download /download /root/.paddleocr


# ... you code ...

```
