// Gateway Proxy Server
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const { calculateCost } = require('./billing');

const app = express();
const proxy = httpProxy.createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  onProxyRes: async (proxyRes, req, res) => {
    // Intercept response
    const body = await getBody(proxyRes);
    const cost = calculateCost(body);

    // Log to database
    await logUsage({
      timestamp: Date.now(),
      endpoint: req.path,
      model: body.model,
      usage: body.usage,
      cost: cost,
    });
  },
});

app.use('/v1', proxy);
app.listen(8080);
