// server.js is the entry point for the Express server.
// Express is a Node.js web framework — it listens for HTTP requests
// and sends back responses. This is completely separate from Vue:
// Vue runs in the browser, Express runs on the server/Node.js.
const express = require('express')
const path    = require('path')
const app     = express()

// ── Middleware ────────────────────────────────────────────────────────────
// Middleware are functions that run on every request before the route handler.

// express.json() parses the request body from a raw JSON string into a
// JavaScript object available at req.body. Without this, req.body is undefined.
app.use(express.json())

// Serve the compiled Vue app's static files (HTML, CSS, JS).
// When Vue is built (npm run build), the output goes to client/dist.
// express.static() serves those files when the browser requests them.
app.use(express.static(path.join(__dirname, 'client', 'dist')))

// ── API Routes ────────────────────────────────────────────────────────────
// Import and mount the router from routes/api.js.
// All routes defined in api.js will be prefixed with /api —
// so router.get('/students') becomes GET /api/students.
const apiRouter = require('./routes/api')
app.use('/api', apiRouter)

// ── Catch-all route ───────────────────────────────────────────────────────
// For any request that doesn't match an API route, send the Vue app's index.html.
// This lets Vue Router handle client-side navigation.
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})

// ── 404 handler ───────────────────────────────────────────────────────────
// If Express reaches this point, no route matched the request.
// Send a 404 response so the client always gets an answer.
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────────────────
// Express identifies error handlers by the 4-argument signature (err, req, res, next).
// Any route that calls next(err) lands here.
// 500 = "Internal Server Error" — something unexpected went wrong on the server.
app.use((err, req, res, next) => {
  console.error(err.stack)   // print the stack trace for debugging
  res.status(500).json({ error: 'Server error', details: err.message })
})

// ── Start listening ───────────────────────────────────────────────────────
// process.env.PORT lets Azure inject the correct port number automatically.
// Locally, fall back to 3000. Open http://localhost:3000 in your browser.
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})