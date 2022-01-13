import { Bits, bitsXOr } from "./lib.ts";

export class FeistelNet<Length extends number, KeyLength extends number> {
    constructor(public encrypt: (key: Bits<KeyLength>, value: Bits<Length>) => Bits<Length>) {
    }

    forwards(keys: Bits<KeyLength>[], start: [Bits<Length>, Bits<Length>]) {
        return keys.reduce(
            ([left, right], key) => [right, bitsXOr(this.encrypt(key, right), left)] as [Bits<Length>, Bits<Length>],
            start,
        );
    }
    backwards(keys: Bits<KeyLength>[], start: [Bits<Length>, Bits<Length>]) {
        return keys.reduceRight(
            ([left, right], key) => [bitsXOr(right, this.encrypt(key, left)), left] as [Bits<Length>, Bits<Length>],
            start,
        );
    }
}
