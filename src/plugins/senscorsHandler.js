import JsEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';

const SENSORSDATA_PROJECT = 'sensorsdata-project';
const SENOSRS_LANGUAGE = 'Sensors-Language';
const SENOSRS_REFERER = 'Sensors-Referer';

class SenscorsHandler {
  init = (instance) => {
    const beforeSend = instance.hookManager.getHook('beforeSend');

    // 加密 body
    beforeSend.tap('handlerEncryption', ({ finalConfig }) => {
      const { encryption, body, headers } = finalConfig;
      let pubKey = '';
      if (typeof encryption === 'string') {
        pubKey = encryption;
      } else if (encryption !== null && typeof encryption === 'object') {
        pubKey = encryption.pubKey;
      }

      if (pubKey) {
        const encrypt = new JsEncrypt();
        const random = CryptoJS.enc.Utf8.parse(
          Math.floor(Math.random() * 1000000) + Date.now().toString()
        ).toString();
        encrypt.setPublicKey(pubKey);
        const encrypted = encrypt.encrypt(random);
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const iv = CryptoJS.lib.WordArray.random(128 / 8);
        const key128Bits100Iterations = CryptoJS.PBKDF2(random, salt, {
          keySize: 128 / 32,
          iterations: 100
        });
        const ciphertext = CryptoJS.AES.encrypt(
          body,
          key128Bits100Iterations,
          {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }
        );
        headers['Aes-Salt'] = salt.toString();
        headers['Aes-Iv'] = iv.toString();
        headers['Aes-Passphrase'] = encrypted;
        finalConfig.body = ciphertext.toString();
      }
    });

    const addHeaderProps = (origin, key, prop) => {
      const { headers } = origin;
      const value = origin[prop];
      if (!(headers && headers[key]) && value) {
        headers[key] = value;
      }
    };

    beforeSend.tap('addProjectName', ({ finalConfig }) => {
      addHeaderProps(finalConfig, SENSORSDATA_PROJECT, 'projectName');
    });
    beforeSend.tap('addProductName', ({ finalConfig }) => {
      addHeaderProps(finalConfig, SENOSRS_REFERER, 'productName');
    });
    beforeSend.tap('addIntl', ({ finalConfig }) => {
      addHeaderProps(finalConfig, SENOSRS_LANGUAGE, 'intl');
    });

    beforeSend.tap('addRequestId', ({ finalConfig, requestId }) => {
      const { requestId: addRequestId, headers } = finalConfig;
      if (!addRequestId) return;
      headers['X-Request-Id'] = requestId;
    });
  }
}

export default new SenscorsHandler();
