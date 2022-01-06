const reduceGroup = (group: number, value: number) => value % group;
const multiply = (group: number, one: number, two: number) => reduceGroup(group, one * two);
const exp = (group: number, base: number, exponent: number) => {
    const current = base;
    while (exponent > 1) {
        base = reduceGroup(group, current * base);
        exponent--;
    }
    return base;
};

export const multiplicativeInverse = (group: number, value: number) => {
    for (let i = 0; i < group; i++) {
        if (multiply(group, i, value) == 1) return i;
    }
    return NaN;
};

const allInverse = (group: number) =>
    new Map(
        Array.from({ length: group }, (_, index) => index).map((
            number,
        ) => [number, multiplicativeInverse(group, number)]),
    );

const orderOf = (p: number, q: number) => (p - 1) * (q - 1);

const ggt = (one: number, two: number) => {
    while (one % two != 0) {
        [one, two] = [two, one % two];
    }
    return two;
};

const ggtHistory = (one: number, two: number) => {
    const history: [number, number, number, number][] = [];
    while (one % two != 0) {
        const remainder = one % two;
        const factor = (one - remainder) / two;
        history.push([one, two, factor, remainder]);
        [one, two] = [two, one % two];
    }
    return history;
};

const linearCombination = (one: number, two: number) => {
    return ggtHistory(one, two)
        .reduceRight(([x, y], [_1, _2, factor]) => [y, x - factor * y], [0, 1]);
};

const possibleKeyPairs = (p: number, q: number) => {
    const inverses = allInverse(p * q);
    const orderInverses = allInverse(orderOf(p, q));
    return [...orderInverses.entries()].filter(([number, inverse]) => !isNaN(inverses.get(number)!) && !isNaN(inverse));
};

const encrypt = (message: number, mb: number, publicKey: number) => reduceGroup(mb, exp(mb, message, publicKey));
const decrypt = (message: number, mb: number, privateKey: number) => reduceGroup(mb, exp(mb, message, privateKey));

// const encryptSigned = (message: number, mb: number, publicKey: number)

const guessPrimeFactors = (value: number): [number, number] => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    for (const prime of primes) {
        if (value % prime == 0) {
            return [prime, value / prime];
        }
    }
    throw new Error(`No prime factors found for ${value}`);
};

const guessPrivateKey = (e: number, m: number) => {
    const primefactors = guessPrimeFactors(m);
    const order = orderOf(...primefactors);
    const privateKey = multiplicativeInverse(order, e);
    return privateKey;
};

// console.log(guessPrivateKey(7, 155));
// console.log(guessPrivateKey(11, 51));
// console.log(multiplicativeInverse(32, 11));
