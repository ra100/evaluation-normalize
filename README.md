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

And as output get something like this:

```
A: 0.5189233261206269
B: 0.47780229480789554
C: 0.40931072342747005
I: 0.3504577145905494
H: 0.27585398051531596
D: 0.1675210553179287
E: 0.016209511592443326
F: 0.014730889472653386
J: -0.0032276771487311784
G: -0.01445069792524245
```

or

```js
{
  A: [ 0.5723758120326807, 0.43589798513115263, 0.5484961811980471 ],
  B: [ 0.4603057335475116, 0.48593672769297425, 0.4824833589955482, 0.4824833589955482 ],
  C: [ 0.20254455303162167, 0.41087861385024205, 0.6145090034005465 ],
  D: [ 0.1969410491073631, 0.13810106152849433 ],
  E: [ 0.012025419606833454, 0.0203936035780532 ],
  F: [ 0.23574301488386595, -0.20628123593855918 ],
  J: [ 0.035588044636579275, 0.0003481425416731465, -0.045619218624445956 ],
  G: [ -0.01445069792524245 ],
  H: [ 0.27585398051531596 ],
  I: [ 0.3504577145905494 ]
}
```

How this works:

- get first evaluation
- based on this, try to modify all other evaluations by setting offset and multiply/divide it, so it as closely matches first evaluation as possible
- repeat this for every other evaluation
- choose what has lowest difference/error
- profit
