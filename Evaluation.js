const DEFAULT_MODIFIER = { multiplier: 1, offset: 0, error: Number.MAX_VALUE }

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
    .reduce((acc, [key, value]) => {
      acc[key] = { etalon: value, compare: scaleB[key], name: key }
      return acc
    }, {})

const getMultiplier = (offset, etalon, value) => etalon / (value + offset)

const getOptimalModifier = (etalon, index, sourceData) =>
  Object.values(sourceData).map((data, i) => {
    if (i === index) return { index: i, skip: true }
    const intersection = getIntersection(etalon, data)
    Object.entries(intersection).forEach(([key, value]) => {
      intersection[key] = {
        ...value,
        offset: value.etalon - value.compare
      }
    })
    Object.values(intersection).forEach(val => {
      const multipliers = Object.values(intersection)
        .filter(({ name }) => name !== val.name)
        .map(({ compare, etalon }) =>
          getMultiplier(val.offset, etalon, compare)
        )
      const min = Math.min(...multipliers)
      const max = Math.max(...multipliers)
      const avg = (min + max) / 2
      const difference = getAverage(multipliers.map(m => Math.abs(m - avg)))
      intersection[val.name] = {
        ...val,
        multipliers,
        averageMultiplier: avg,
        multiplierError: difference
      }
    })
    const modifier = Object.values(intersection).reduce(
      (
        acc,
        { averageMultiplier: multiplier, multiplierError: error, offset }
      ) => {
        if (error > acc.error) return acc
        return { multiplier, offset, error }
      },
      { ...DEFAULT_MODIFIER }
    )
    // console.log('Modifier', modifier)
    return { index: i, modifier }
  })

const nomalizeEvaluations = sourceData => {
  const offsetSource = offsetAndMultiply(sourceData, 1, 1)
  offsetSource.forEach((data, index) => {
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
  const normalizedEvaluations = offsetAndMultiply(offsetSource, -1, 1)
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

const Evaluation = {
  getUsers,
  getAverage,
  modifySingle,
  offsetAndMultiply,
  getIntersection,
  getMultiplier,
  getOptimalModifier,
  nomalizeEvaluations,
  userEvaluations,
  averageEvaluations
}

module.exports = Evaluation
