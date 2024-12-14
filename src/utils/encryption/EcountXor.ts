import { XOR_KEY } from "../../constants/global";

export class EcountXor {
  static encrypt(text: string, key: string = XOR_KEY): string {
    const bytes = Buffer.from(text, "utf8");
    const result: string[] = [];
    const keyLength = key.length;

    for (let i = 0; i < bytes.length; i++) {
      const xorByte = bytes[i] ^ key.charCodeAt(i % keyLength);
      const hex = xorByte.toString(16).padStart(2, "0");
      result.push(hex.toLowerCase());
    }

    return result.join("");
  }

  static decrypt(text: string, key: string = XOR_KEY): string {
    let input = text;
    const result: number[] = [];
    let keyToUse = key;

    if (!keyToUse) {
      const keyLength = parseInt(input.charAt(0), 10);
      keyToUse = input.slice(1, 1 + keyLength);
      input = input.slice(1 + keyLength);
    }

    const keyLength = keyToUse.length;

    for (let i = 0, j = 0; i < input.length; i += 2, j++) {
      const hexPair = input.slice(i, i + 2);
      const value = parseInt(hexPair, 16);
      const decryptedByte = value ^ keyToUse.charCodeAt(j % keyLength);
      result.push(decryptedByte);
    }

    return Buffer.from(result).toString("utf8");
  }
}


export default EcountXor;
