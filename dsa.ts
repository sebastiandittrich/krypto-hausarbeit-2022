const multiplicativeInverse = (group: bigint, value: bigint): bigint => {
    for (let i = 0n; i < group; i++) {
        if ((i * value) % group == 1n) return i;
    }
    throw new Error(`Inverse of ${value} in ${group} not found!`);
};

const combinativeInverse = (value: bigint, combine: Combiner) => {
    let current = 1n;
    while (true) {
        if (combine(value, current) == 1n) return current;
        current++;
    }
};

type Combiner = (one: bigint, two: bigint) => bigint;

const combineNTimes = (value: bigint, N: bigint, combine: Combiner) => {
    if (N < 1) throw new Error("Cannot combine 0 times");

    let current = value;
    for (let i = 1n; i < N; i++) {
        current = combine(current, value);
    }
    return current;
};

type Config = {
    g: bigint;
    h: (x: bigint) => bigint;
    hN: (N: bigint) => bigint;
    combine: Combiner;
};

function sign(dA: bigint, { N, k }: { N: bigint; k: bigint }, { g, h, hN, combine }: Config) {
    const rk = combineNTimes(g, k, combine);
    return {
        N,
        s: combine(combine(combine(dA, h(rk)) + hN(N), 1n), combinativeInverse(k, combine)),
        // s: ((((dA * h(rk)) + hN(N)) % (G - 1n)) * multiplicativeInverse(G - 1n, k)) % G,
        rk,
    };
}

function verify(eA: bigint, { N, s, rk }: { N: bigint; s: bigint; rk: bigint }, { g, h, hN, combine }: Config) {
    return combineNTimes(rk, s, combine) ==
        combine(combineNTimes(eA, h(rk), combine), combineNTimes(g, hN(N), combine));
    // return (rk ** s) % G == (eA ** h(rk) * g ** hN(N)) % G;
}

const config: Config = {
    g: 2n,
    h: (x) => x,
    hN: (x) => 2n ** x % 11n,
    combine: (one, two) => one * two % 11n,
};

console.log(sign(4n, { N: 8n, k: 7n }, config));

console.log(verify(5n, { N: 8n, rk: 7n, s: 3n }, config));
