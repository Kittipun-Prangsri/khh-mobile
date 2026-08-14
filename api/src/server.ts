import app from './app.js';
import { config } from './config/index.js';

const PORT = parseInt(config.port, 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(` KHH Safe-Connect Backend Server Started`);
  console.log(` Port: ${PORT}`);
  console.log(` Mode: ${config.nodeEnv}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`========================================`);
});
