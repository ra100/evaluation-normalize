# Evaluation Scales Normalizer

There was an idea: Is it possible to evaluate (employees) using relative scale? Always to put people on scale 0 - 1 (0 - 100%, min-max)? And how to make this work, to have something meaningful from this?

This is POC, and I'm still not sure if this proves that it can work.

This is how data input can look like.

```js
[
  { A: 1, B: 0.8, C: 0.34, D: 0.33, E: 0 },
  { B: 1, A: 0.9, C: 0.85, F: 0.5, J: 0.1, G: 0 },
  { B: 1, H: 0.7, D: 0.5, J: 0.3, F: 0 },
  { C: 1, A: 0.9, B: 0.8, I: 0.6, E: 0.1, J: 0 }
]
```

How this works:

- get first evaluation
- based on this, try to modify all other evaluations by setting offset and multiply/divide it, so it as closely matches first evaluation as possible
- repeat this for every other evaluation
- choose what has lowest difference/error
- profit
