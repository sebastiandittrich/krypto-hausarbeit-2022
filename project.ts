import { FeistelNet } from "./feistelnet.ts";
import { minides } from "./minides.ts";
import { Bits, splitBy, Tuple } from "./lib.ts";
import { calculatePrivateKey, decrypt, encrypt } from "./rsa.ts";

const p = 882551n;
const q = 767617n;
const m = p * q;
const publicKey = 734981927n;
const privateKey = calculatePrivateKey(publicKey, p, q);

// Key length 6, Chunk size 4
const feistelnet = new FeistelNet<4, 6>(minides({
    expand: ([one, two, three, four]) => [one, one, two, three, three, four],
    sBoxes: [
        [
            [1, 0, 2, 3],
            [3, 2, 0, 1],
        ],
        [
            [2, 3, 0, 1],
            [1, 2, 3, 0],
        ],
    ],
}));

function getMessage() {
}

function decryptMessage({ decryp }) {
    const { encryptedMessage, encrypteddeskeys } = getMessage();

    const decrypteddeskeys = decrypt(encrypteddeskeys, privateKey, m);
    console.log("Decrypted DES keys:", decrypteddeskeys);

    const decodeddeskeys = splitBy(
        decrypteddeskeys.toString(2).split("").map((bit) => parseInt(bit)),
        6,
    ) as Tuple<Bits<6>, 3>;
    console.log("Decoded DES keys:", decodeddeskeys);

    const decrypted = encryptedMessage.reduce(
        (decrypted, chunk) => [...decrypted, feistelnet.backwards(decodeddeskeys, chunk)],
        [] as [Bits<4>, Bits<4>][],
    );
    console.log("Decrypted:", decrypted);

    const decoded = decrypted
        .map(([left, right]) => [...left, ...right])
        .map((chunk) => chunk.join(""))
        .map((chunk) => parseInt(chunk, 2))
        .map((char) => String.fromCharCode(char))
        .join("");
    console.log("Decoded:", decoded);
}
