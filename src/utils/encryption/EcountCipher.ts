import * as CryptoJS from "crypto-js";
import * as pako from "pako";

export class EcountCipher {
  public timestamp: string;
  private cipherIV: CryptoJS.lib.WordArray;
  private cipherKey: CryptoJS.lib.WordArray;

  constructor() {
    this.timestamp = Date.now().toString();
    const timeStampHash = CryptoJS.SHA1(this.timestamp).toString();
    this.cipherIV = CryptoJS.enc.Utf8.parse(timeStampHash.split("").reverse().join("").substring(0, 16));
    this.cipherKey = CryptoJS.enc.Utf8.parse(timeStampHash.substring(0, 16));
  }

  public compress(data: string): string {
    const compressed = pako.deflateRaw(data);
    return Buffer.from(compressed).toString("base64");
  }

  public decompress(data: string): string {
    const decompressed = pako.inflate(Buffer.from(data, "base64"), { to: "string" });
    return Buffer.from(decompressed).toString("utf-8");
  }

  public encrypt(data: string): string {
    const compressed = this.compress(data);
    const encrypted = CryptoJS.AES.encrypt(compressed, this.cipherKey, {
      keysize: 16,
      iv: this.cipherIV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  public decrypt(data: string): string {
    const decrypted = CryptoJS.AES.decrypt(data, this.cipherKey, {
      keysize: 16,
      iv: this.cipherIV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return this.decompress(decrypted.toString(CryptoJS.enc.Utf8));
  }
}

export default EcountCipher;

