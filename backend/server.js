// server.js
import express from 'express';
import fetch from 'node-fetch';  // Install with npm
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import cors from 'cors';


dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());  // Enable CORS for local dev if frontend is on a different port

app.post('/api/databricks-proxy', async (req, res) => {
  try {
    const response = await fetch("https://dbc-73841bd4-d7dd.cloud.databricks.com/serving-endpoints/agents_datalink-lineagedemo-alj_cc_agent/invocations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DATABRICKS_TOKEN}`,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":  "*"
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Databricks proxy error" });
  }
});


const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Proxy server running on port 3001'));
