import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('Starting application...');
dotenv.config();
console.log('Environment loaded');

import { db } from './db/index.js';
import { dietLogs } from './db/schema.js';
import { eq, desc } from 'drizzle-orm';

console.log('Imports completed');

const app = express();
const port = process.env.PORT || 8080;

console.log('Express app created, port:', port);

// Middleware
app.use(cors());
app.use(express.json());
console.log('Middleware configured');

// Test database connection on startup
console.log('Testing database connection...');
try {
  // Don't await here, just log that we're trying
  db.select().from(dietLogs).limit(1).then(() => {
    console.log('Database connection successful');
  }).catch(err => {
    console.log('Database connection failed:', err.message);
  });
} catch (err) {
  console.log('Database setup error:', err.message);
}

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Diet Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/app', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Diet Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/ping', (req, res) => {
  console.log('Ping route hit at:', new Date().toISOString());
  res.send('pong');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Diet tracker API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/drizzle-test', async (req, res) => {
    try {
        const result = await db.select().from(dietLogs).limit(1);
        res.json({
            success: true,
            message: 'Drizzle connection working and table exists',
            tableExists: true
        });
    } 
    catch(err) {
        res.status(500).json({
            success: true,
            message: 'Drizzle connection working but table needs to be created',
            tableExists: false,
            error: err.message
        });
    }
});

// GET all diet logs for a user
app.get('/api/diet-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await db.select()
      .from(dietLogs)
      .where(eq(dietLogs.userId, userId))
      .orderBy(desc(dietLogs.loggedAt));
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new diet log
app.post('/api/diet-logs', async (req, res) => {
  try {
    const { userId, foodName, notes, loggedAt } = req.body;
    
    if (!userId || !foodName) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and foodName are required' 
      });
    }

    const newLog = await db.insert(dietLogs)
      .values({
        userId,
        foodName,
        notes,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date()
      })
      .returning();

    res.status(201).json({ success: true, data: newLog[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update a diet log
app.put('/api/diet-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { foodName, notes, loggedAt } = req.body;
    
    const updateData = {};
    if (foodName) updateData.foodName = foodName;
    if (notes !== undefined) updateData.notes = notes;
    if (loggedAt) updateData.loggedAt = new Date(loggedAt);
    
    const updatedLog = await db.update(dietLogs)
      .set(updateData)
      .where(eq(dietLogs.id, parseInt(id)))
      .returning();

    if (updatedLog.length === 0) {
      return res.status(404).json({ success: false, error: 'Diet log not found' });
    }

    res.json({ success: true, data: updatedLog[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE a diet log
app.delete('/api/diet-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLog = await db.delete(dietLogs)
      .where(eq(dietLogs.id, parseInt(id)))
      .returning();

    if (deletedLog.length === 0) {
      return res.status(404).json({ success: false, error: 'Diet log not found' });
    }

    res.json({ success: true, message: 'Diet log deleted', data: deletedLog[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);

});



