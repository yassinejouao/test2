// const express = require("express");
// const { Pool } = require("pg");
// const WebSocket = require("ws"); // This imports the ws WebSocket server package
// const cors = require("cors");

// const app = express();
// const PORT = 3001;

// // Middleware
// app.use(cors());

// // PostgreSQL database connection
// const pool = new Pool({
//   connectionString:
//     "postgresql://username:password@localhost:5432/book_social_network",
// });

// pool.connect(async (err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//     return;
//   }
//   console.log("Connected to PostgreSQL database");

//   // Create the positions table if it doesn't exist
//   const createTableQuery = `
//         CREATE TABLE IF NOT EXISTS positions (
//             id SERIAL PRIMARY KEY,
//             latitude FLOAT NOT NULL,
//             longitude FLOAT NOT NULL,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );
//     `;

//   try {
//     await pool.query(createTableQuery);
//     console.log('Table "positions" ensured');
//   } catch (err) {
//     console.error("Error creating table:", err);
//   }
// });

// // WebSocket server for real-time updates
// const wss = new WebSocket.Server({ port: 8080 });

// wss.on("connection", (ws) => {
//   console.log("Client connected to WebSocket");

//   // You can handle messages from the WebSocket client here, if necessary
//   ws.on("message", (message) => {
//     console.log("Received message:", message);
//   });

//   ws.on("close", () => {
//     console.log("WebSocket connection closed");
//   });
// });

// // Fetch position from DB and notify WebSocket clients
// const broadcastPosition = async () => {
//   try {
//     const res = await pool.query(
//       "SELECT latitude, longitude FROM positions ORDER BY updated_at DESC LIMIT 1"
//     );

//     if (res.rows.length > 0) {
//       const position = res.rows[0];

//       // Iterate over each connected WebSocket client and send data
//       wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           console.log(JSON.stringify(position));
//           client.send(JSON.stringify(position)); // Send the position data to client
//         }
//       });
//     }
//   } catch (err) {
//     console.error("Database query error:", err);
//   }
// };

// // Poll database for updates every 2 seconds
// setInterval(broadcastPosition, 2000);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// const express = require("express");
// const { Pool } = require("pg");
// const cors = require("cors");

// const app = express();
// const PORT = 3001;

// // Middleware
// app.use(cors());
// app.use(express.json()); // To handle JSON payloads

// // PostgreSQL database connection
// const pool = new Pool({
//   connectionString:
//     "postgresql://username:password@localhost:5432/book_social_network",
// });

// pool.connect(async (err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//     return;
//   }
//   console.log("Connected to PostgreSQL database");

//   // Create the positions table if it doesn't exist
//   const createPositionsTableQuery = `
//     CREATE TABLE IF NOT EXISTS positions (
//       id SERIAL PRIMARY KEY,
//       latitude FLOAT NOT NULL,
//       longitude FLOAT NOT NULL,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;

//   // Create the polygons table if it doesn't exist
//   const createPolygonsTableQuery = `
//     CREATE TABLE IF NOT EXISTS polygons (
//       id SERIAL PRIMARY KEY,
//       coordinates GEOMETRY(Polygon, 4326), -- Stores polygon data using PostGIS geometry type
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;

//   try {
//     await pool.query(createPositionsTableQuery);
//     await pool.query(createPolygonsTableQuery);
//     console.log('Tables "positions" and "polygons" ensured');
//   } catch (err) {
//     console.error("Error creating tables:", err);
//   }
// });

// // API endpoint to fetch the latest position
// app.get("/api/position", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT latitude, longitude FROM positions ORDER BY updated_at DESC LIMIT 1"
//     );
//     if (result.rows.length > 0) {
//       res.json(result.rows[0]);
//     } else {
//       res.status(404).json({ message: "No position found" });
//     }
//   } catch (err) {
//     console.error("Database query error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // API endpoint to save a polygon to the database
// app.post("/api/polygon", async (req, res) => {
//   const { coordinates } = req.body; // Coordinates should be in GeoJSON format
//   if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
//     return res.status(400).json({ message: "Invalid polygon data" });
//   }

//   try {
//     // Convert the polygon coordinates to PostGIS geometry format
//     const polygonGeoJSON = `SRID=4326;POLYGON((${coordinates
//       .map((coord) => `${coord.lng} ${coord.lat}`)
//       .join(", ")}))`;

//     // Insert polygon into the database
//     const insertPolygonQuery = `
//       INSERT INTO polygons (coordinates)
//       VALUES (ST_GeomFromText($1, 4326))
//       RETURNING *;
//     `;

//     const result = await pool.query(insertPolygonQuery, [polygonGeoJSON]);
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error saving polygon:", err);
//     res.status(500).json({ message: "Failed to save polygon" });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL database connection
const pool = new Pool({
  connectionString:
    "postgresql://username:password@localhost:5432/book_social_network", // Update with your credentials
});

pool.connect(async (err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to PostgreSQL database");

  // Create the positions table if it doesn't exist
  const createPositionsTableQuery = `
    CREATE TABLE IF NOT EXISTS positions (
      id SERIAL PRIMARY KEY,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPolygonsTableQuery = `
    CREATE TABLE IF NOT EXISTS polygons (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      coordinates FLOAT[][] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createPositionsTableQuery);
    console.log('Table "positions" ensured');

    await pool.query(createPolygonsTableQuery);
    console.log('Table "polygons" ensured');

    // Create and insert a random polygon near the given coordinates
    await insertRandomPolygon();
  } catch (err) {
    console.error("Error creating tables:", err);
  }
});

// Function to generate a random point within a specified distance (in meters) from a central point
const generateRandomPoint = (lat, lon, radius) => {
  const randomRadius = radius * Math.random(); // Generate a random distance from the center
  const randomAngle = Math.random() * 2 * Math.PI; // Random angle (in radians)

  // Convert latitude and longitude to radians
  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  // Calculate new coordinates
  const deltaLat = randomRadius / 111300; // 1 degree of latitude = 111.3 km
  const deltaLon = randomRadius / (111300 * Math.cos(latRad)); // Adjust for longitude

  // Random point coordinates
  const newLat = lat + deltaLat * Math.sin(randomAngle);
  const newLon = lon + deltaLon * Math.cos(randomAngle);

  return [newLat, newLon];
};

// Function to insert a random polygon near San Francisco
const insertRandomPolygon = async () => {
  const centerLat = 37.7749; // San Francisco latitude
  const centerLon = -122.4194; // San Francisco longitude
  const radius = 5000; // Radius of 5km around the center

  // Generate random points to form a polygon
  const points = [];
  for (let i = 0; i < 5; i++) {
    points.push(generateRandomPoint(centerLat, centerLon, radius));
  }

  // Close the polygon by repeating the first point
  points.push(points[0]);

  const name = "Random Polygon Near San Francisco";

  try {
    const result = await pool.query(
      "INSERT INTO polygons (name, coordinates) VALUES ($1, $2) RETURNING *",
      [name, points]
    );
    console.log("Inserted polygon:", result.rows[0]);
  } catch (err) {
    console.error("Error inserting polygon:", err);
  }
};

// API endpoint to fetch all polygons
app.get("/api/polygons", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM polygons");
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to insert
app.post("/api/polygon/sf", async (req, res) => {
  // Extract points and optional name from the request body
  const { points, name } = req.body;

  // Validate the points and name
  if (!points || !Array.isArray(points) || points.length < 3) {
    return res.status(400).json({ message: "Invalid points data" });
  }

  // If no name is provided, use a default name
  const polygonName = name || "Unnamed Polygon";

  try {
    // Insert the polygon with the provided points and name into the database
    const result = await pool.query(
      "INSERT INTO polygons (name, coordinates) VALUES ($1, $2) RETURNING *",
      [polygonName, points]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting polygon:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// // API endpoint to fetch the latest position
app.get("/api/position", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT latitude, longitude FROM positions ORDER BY updated_at DESC LIMIT 1"
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "No position found" });
    }
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
