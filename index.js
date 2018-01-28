const {
  userEvaluations,
  averageEvaluations,
  createHeatmap
} = require('./Evaluation')

const sourceData = [
  { A: 1, B: 0.8, C: 0.34, D: 0.33, E: 0 },
  { B: 1, A: 0.9, C: 0.85, F: 0.5, J: 0.1, G: 0 },
  { B: 1, H: 0.7, D: 0.5, J: 0.3, F: 0 },
  { C: 1, A: 0.9, B: 0.8, I: 0.6, E: 0.1, J: 0 }
]

const userev = userEvaluations(sourceData)
const average = averageEvaluations(sourceData).map(
  ({ name, average }) => `${name}: ${average}`
)
const heatmap = createHeatmap(userev, 5)

console.log('Evaluations:\n', average.join('\n'))
console.log('Merged evaluations:\n', userev)
console.log('Heatmap:\n', heatmap)
