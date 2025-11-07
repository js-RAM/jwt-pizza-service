const config = require('./config');

const os = require('os');
const metrics = []
// Metrics stored in memory
const requests = {};

let logins = 0;
let logouts = 0;

let successLogins = 0;
let failureLogins = 0;

let revenue = 0;
let pizzasSold = 0;
let pizzaFailures = 0;

// Middleware to track requests
function requestTracker(req, res, next) {
  const endpoint = `${req.method}`;
  requests[endpoint] = (requests[endpoint] || 0) + 1;
  next();
}

function getLatency(req, res, next) {
  const start = Date.now();
  const endpoint = `[${req.method}] ${req.path}`
  res.on('finish', () => {
    const latency = Date.now() - start;
    metrics.push(createMetric('latency', latency, '1', 'sum', 'asInt', { endpoint }))
  });
  next();
}

function logUserIn() {
  logins++;
}

function logUserOut() {
  logouts++;
}

function authenticationSuccess() {
  successLogins++;
}

function authenticationFailure() {
  failureLogins++;
}

function pizzaMetrics(amount, latency, price) {
  revenue += price;
  if (amount) pizzasSold += amount;
  else pizzaFailures++;
  const endpoint = "pizza creation"
  metrics.push(createMetric('latency', latency, '1', 'sum', 'asInt', { endpoint }))
}

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

// This will periodically send metrics to Grafana
setInterval(() => {
  Object.keys(requests).forEach((endpoint) => {
    metrics.push(createMetric('requests', requests[endpoint], '1', 'sum', 'asInt', { endpoint }));
  });
  metrics.push(createMetric('cpu', getCpuUsagePercentage(), '%', 'gauge', 'asDouble', { }))
  metrics.push(createMetric('memory', getMemoryUsagePercentage(), '%', 'gauge', 'asDouble', { }))

  metrics.push(createMetric('logins', logins, '1', 'sum', 'asInt', { }))
  metrics.push(createMetric('logouts', logouts, '1', 'sum', 'asInt', { }))

  metrics.push(createMetric('authentication', successLogins, '1', 'sum', 'asInt', { status: 'success' }))
  metrics.push(createMetric('authentication', failureLogins, '1', 'sum', 'asInt', { status: 'failure' }))
  
  metrics.push(createMetric('purchases', pizzasSold, '1', 'sum', 'asInt', { status: "sold" }));
  metrics.push(createMetric('purchases', pizzaFailures, '1', 'sum', 'asInt', { status: "failed" }));
  metrics.push(createMetric("revenue", revenue, '1', 'sum', 'asDouble', { }));

  sendMetricToGrafana(metrics);
  metrics.length = 0;
}, 5000);

function createMetric(metricName, metricValue, metricUnit, metricType, valueType, attributes) {
  attributes = { ...attributes, source: config.metrics.source };

  const metric = {
    name: metricName,
    unit: metricUnit,
    [metricType]: {
      dataPoints: [
        {
          [valueType]: metricValue,
          timeUnixNano: Date.now() * 1000000,
          attributes: [],
        },
      ],
    },
  };

  Object.keys(attributes).forEach((key) => {
    metric[metricType].dataPoints[0].attributes.push({
      key: key,
      value: { stringValue: attributes[key] },
    });
  });

  if (metricType === 'sum') {
    metric[metricType].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
    metric[metricType].isMonotonic = true;
  }

  return metric;
}

function sendMetricToGrafana(metrics) {
  const body = {
    resourceMetrics: [
      {
        scopeMetrics: [
          {
            metrics,
          },
        ],
      },
    ],
  };

  fetch(`${config.metrics.url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${config.metrics.apiKey}`, 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
    })
    .catch((error) => {
      console.error('Error pushing metrics:', error);
    });
}

module.exports = { requestTracker, logUserIn, logUserOut, getLatency, authenticationSuccess, authenticationFailure, pizzaMetrics };