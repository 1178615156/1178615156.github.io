# 2025-08-05-支付宝pythonSDK签名校验失败.md

## 环境
- python: 3.11
- sdk: 3.7.582
- 报错log:
```log
  File "c:\Users\yjs\miniconda3\Lib\site-packages\alipay\aop\api\DefaultAlipayClient.py", line 300, in execute
    query_string, params = self.__prepare_request(request)
                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "c:\Users\yjs\miniconda3\Lib\site-packages\alipay\aop\api\DefaultAlipayClient.py", line 89, in __prepare_request
    common_params, params = self.__prepare_request_params(request)
                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "c:\Users\yjs\miniconda3\Lib\site-packages\alipay\aop\api\DefaultAlipayClient.py", line 127, in __prepare_request_params
    sign = sign_with_rsa2(self.__config.app_private_key, sign_content, self.__config.charset)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "c:\Users\yjs\miniconda3\Lib\site-packages\alipay\aop\api\util\SignatureUtils.py", line 49, in sign_with_rsa2
    signature = rsa.sign(sign_content, rsa.PrivateKey.load_pkcs1(private_key, format='PEM'), 'SHA-256')
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "c:\Users\yjs\miniconda3\Lib\site-packages\rsa\key.py", line 125, in load_pkcs1
    return method(keyfile)
           ^^^^^^^^^^^^^^^
  File "c:\Users\yjs\miniconda3\Lib\site-packages\rsa\key.py", line 613, in _load_pkcs1_pem
    return cls._load_pkcs1_der(der)
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "c:\Users\yjs\miniconda3\Lib\site-packages\rsa\key.py", line 548, in _load_pkcs1_der
    key = cls(*as_ints)
          ^^^^^^^^^^^^^
TypeError: int() argument must be a string, a bytes-like object or a real number, not 'Sequence'
```
## 原因
SDK里只带的RSA签名不对,换成`pycryptodome`就行 `pip install pycryptodome bcrypt`

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
import base64
from base64 import decodebytes
from datetime import datetime
from datetime import timedelta

import alipay.aop.api.util.SignatureUtils
from alipay.aop.api.domain.TradeItemResult import TradeItemResult
from loguru import logger


def my_sign_with_rsa2(private_key, sign_content, charset):
    '''
        pip install pycryptodome bcrypt
    '''

    from Crypto.Hash import SHA256
    from Crypto.PublicKey import RSA
    from Crypto.Signature import PKCS1_v1_5

    signer = PKCS1_v1_5.new(RSA.importKey(decodebytes(private_key.encode())))
    signature = signer.sign(SHA256.new(sign_content.encode()))
    return base64.b64encode(signature).decode('UTF-8')

# 替换掉SDK里的签名方法
alipay.aop.api.util.SignatureUtils.sign_with_rsa2 = my_sign_with_rsa2
```
