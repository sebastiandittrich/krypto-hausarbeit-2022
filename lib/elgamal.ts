import { inverse } from "./lib.ts";

export function encrypt(message: bigint, key: bigint, group: bigint) {
    return message * key % group;
}
export function decrypt(message: bigint, key: bigint, group: bigint) {
    return message * inverse(key, group) % group;
}
