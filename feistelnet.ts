import { minides } from "./minides.ts";
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

const taskTwoDES = minides({
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
});

const minidesnet = new FeistelNet<4, 6>(taskTwoDES);

// console.log(minidesnet.forwards(
//     [
//         [1, 1, 1, 1, 1, 1],
//         [1, 1, 1, 0, 1, 1],
//         [0, 1, 1, 1, 0, 0],
//     ],
//     [[0, 0, 0, 0], [0, 0, 0, 0]],
// ));
