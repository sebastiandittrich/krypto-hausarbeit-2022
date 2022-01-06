import { multiplicativeInverse } from "./group.ts";

const calculateKey = (secretExponent: bigint, publicBase: bigint, order: bigint) =>
    publicBase ** secretExponent % order;

const findPrimitiveRoot = (order: bigint) => {
    let current = 2n;
    while (true) {
        for (let i = 1n; i < order; i++) {
            const value = current ** i % order;
            if (value == 1n) {
                if (i == order - 1n) {
                    return current;
                } else {
                    break;
                }
            }
        }
        current++;
    }
};

const encryptkey = calculateKey(12n, 2n, 31n);
const decryptkey = multiplicativeInverse(31, Number(encryptkey));

console.log("encryptkey", encryptkey);
console.log("decryptkey", decryptkey);
