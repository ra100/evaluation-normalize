const DEFAULT_MODIFIER = { multiplier: 1, offset: 0, error: Number.MAX_VALUE }
const PRECISION = 10000

const round = number => Math.floor(number * PRECISION) / PRECISION

const getUsers = data =>
  Object.keys(data.reduce((a, c) => ({ ...a, ...c }), {}))

const getAverage = arr =>
  arr.reduce((acc, curr, index) => (acc * index + curr) / (index + 1), 0)

const modifySingle = (feedback, offset, multiplier) =>
  Object.entries(feedback)
    .map(([key, val]) => [key, (val + offset) * multiplier])
    .reduce((acc, curr) => {
      acc[curr[0]] = curr[1]
      return acc
    }, {})

const offsetAndMultiply = (source, offset, multiplier) =>
  source.map(feedback => modifySingle(feedback, offset, multiplier))

const getIntersection = (scaleA = {}, scaleB = {}) =>
  Object.entries(scaleA)
    .filter(([key]) => scaleB[key] !== undefined)
    .map(([key, value]) => ({
      etalon: value,
      compare: scaleB[key],
      name: key,
      offset: round(value - scaleB[key])
    }))

const mapMultiplier = offset => ({ etalon, compare }) =>
  round(etalon / (compare + offset))

const reduceModifier = (
  modifier,
  { multiplier, error, offset }
) => {
  if (error > modifier.error) return modifier
  return { multiplier, offset, error }
}

const mapModifier = (val, i, intersection) => {
  const multipliers = intersection
    .filter(({ name }) => name !== val.name)
    .map(mapMultiplier(val.offset))
  if (multipliers.length === 0) {
    multipliers.push(1)
  }
  const avg = round(getAverage(multipliers))
  const difference = getAverage(multipliers.map(m => Math.abs(m - avg)))
  return {
    ...val,
    multipliers,
    multiplier: avg,
    error: difference
  }
}

const getOptimalModifier = (etalon, index, sourceData) =>
  Object.values(sourceData).map((data, i) => {
    if (i === index) return { index: i, skip: true }
    const modifier = getIntersection(etalon, data)
      .map(mapModifier)
      .reduce(reduceModifier, { ...DEFAULT_MODIFIER })
    // console.log('Modifier', modifier)
    return { index: i, modifier }
  })

const nomalizeEvaluations = sourceData => {
  const offsetSource = offsetAndMultiply(sourceData, 100, 1)
  sourceData.forEach((data, index) => {
    getOptimalModifier(offsetSource[index], index, offsetSource).map(
      modifier => {
        if (modifier.skip) return
        offsetSource[modifier.index] = modifySingle(
          offsetSource[modifier.index],
          modifier.modifier.offset,
          modifier.modifier.multiplier
        )
      }
    )
  })
  const normalizedEvaluations = offsetAndMultiply(offsetSource, -100, 1)
  // console.log(
  //   'Normalized Evaluations:\n',
  //   JSON.stringify(normalizedEvaluations)
  // )
  return normalizedEvaluations
}

const userEvaluations = sourceData => {
  const normalizedEvaluations = nomalizeEvaluations(sourceData)
  const evaluation = {}
  normalizedEvaluations.forEach(feedback => {
    Object.entries(feedback).forEach(([name, value]) => {
      evaluation[name] = [...(evaluation[name] || []), value]
    })
  })
  return evaluation
}

const averageEvaluations = sourceData => {
  const evaluation = userEvaluations(sourceData)
  return Object.entries(evaluation)
    .map(([name, value]) => ({
      name,
      average: getAverage(value)
    }))
    .sort(({ average: a }, { average: b }) => b - a)
}


const getRange = userEvals => {
  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE
  Object.values(userEvals).forEach(val =>
    val.forEach(a => {
      min = Math.min(a, min)
      max = Math.max(a, max)
    })
  )
  return { min, max }
}

const createHeatmap = (userEvals, buckets = 5) => {
  const range = getRange(userEvals)
  const intervalLength = (range.max - range.min) / buckets
  const ranges = Array(buckets)
    .fill()
    .map((val, index) => ({
      from: round(range.min + index * intervalLength),
      to: round(range.min + (index + 1) * intervalLength)
    }))
  const evals = {}
  Object.entries(userEvals).forEach(([name, val]) => {
    const heatmap = Array(buckets).fill(0)
    val.forEach(x => {
      const index = ranges.findIndex(
        ({ from, to }) => from <= round(x) === round(x) <= to
      )
      heatmap[index] = heatmap[index] + 1
    })
    evals[name] = heatmap
  })
  return Object.entries(evals).map(([name, data]) => ({
    name,
    data,
    max: data.reduce((a, c) => Math.max(a, c), Number.MIN_VALUE),
    min: data.reduce((a, c) => Math.min(a, c), Number.MAX_VALUE)
  }))
}

const Evaluation = {
  getUsers,
  getRange,
  getAverage,
  modifySingle,
  offsetAndMultiply,
  getIntersection,
  mapMultiplier,
  getOptimalModifier,
  nomalizeEvaluations,
  reduceModifier,
  mapModifier,
  userEvaluations,
  averageEvaluations,
  createHeatmap
}

module.exports = Evaluation
