import fs from 'fs';
import path from 'path';
import { TripSnapshot, TripVersionItem } from '@/types/trip';
import { UserProfile } from '@/types/user';

interface UserRecord extends UserProfile {
  passwordHash: string;
}

interface ConversationRecord {
  id: string;
  tripId: string;
  userId?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    appliedChanges?: any;
  }>;
  updatedAt: string;
}

interface AdminConfigRecord {
  id: string;
  activeAiModel: string;
  temperature: number;
  maxTokens: number;
  promptVersion: string;
  prompts: {
    systemPrompt: string;
    planningPrompt: string;
    modificationPrompt: string;
  };
  metrics: {
    totalGenerations: number;
    totalModifications: number;
    totalFinalized: number;
    totalExports: number;
    failedGenerations: number;
  };
}

interface DatabaseSchema {
  users: UserRecord[];
  trips: TripSnapshot[];
  tripVersions: Record<string, TripVersionItem[]>;
  aiConversations: ConversationRecord[];
  adminConfig: AdminConfigRecord;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_ADMIN_CONFIG: AdminConfigRecord = {
  id: 'global-config',
  activeAiModel: 'gemini-2.5-flash',
  temperature: 0.3,
  maxTokens: 4000,
  promptVersion: 'v2.4-enterprise',
  prompts: {
    systemPrompt: `You are the lead travel architect for VoyageAI, a luxury and precision AI travel concierge. 
You design logistically sound, culturally vibrant, budget-conscious travel itineraries. 
You follow strict geographic efficiency, realistic transit times, opening hours, and budget contingency margins.`,
    planningPrompt: `Generate a structured, multi-day itinerary adhering to the exact JSON schema. Ensure 0km-to-realistic travel buffers, pacing matching the user's energy preference, and zero unrealistic schedules.`,
    modificationPrompt: `Evaluate dependency cascade before editing: if an activity or city is removed, recalculate transit, hotel stay count, daily schedule, and total budget.`
  },
  metrics: {
    totalGenerations: 42,
    totalModifications: 118,
    totalFinalized: 31,
    totalExports: 27,
    failedGenerations: 0
  }
};

// ─── Hybrid Storage: In-Memory (primary) + File System (fallback for local dev) ───
// On Vercel, the filesystem is read-only so fs.writeFileSync silently fails.
// This global in-memory singleton ensures data persists across API calls within 
// the same serverless cold-start instance.

const globalForDb = globalThis as unknown as { __voyageDb?: DatabaseSchema };

function getInitialDatabase(): DatabaseSchema {
  return {
    users: [
      {
        id: 'demo-user-1',
        name: 'Aarav Sharma',
        email: 'demo@voyage.ai',
        passwordHash: '$2a$10$w09u7L4iP2YwO9yZsmYtxehYk1qF79M2K64pS.jU48aXo3P0gq.eq', // password: Password123!
        homeCity: 'Hyderabad',
        currency: 'INR',
        preferredTravelStyles: ['relaxed', 'nature', 'spiritual', 'food-focused'],
        dietaryRestrictions: ['vegetarian'],
        role: 'user',
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin-user-1',
        name: 'Elena Rostova (Admin)',
        email: 'admin@voyage.ai',
        passwordHash: '$2a$10$w09u7L4iP2YwO9yZsmYtxehYk1qF79M2K64pS.jU48aXo3P0gq.eq', // password: Password123!
        homeCity: 'San Francisco',
        currency: 'USD',
        preferredTravelStyles: ['luxury', 'cultural', 'photography'],
        dietaryRestrictions: [],
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ],
    trips: [],
    tripVersions: {},
    aiConversations: [],
    adminConfig: { ...INITIAL_ADMIN_CONFIG }
  };
}

function loadDatabase(): DatabaseSchema {
  // Return from in-memory cache if available
  if (globalForDb.__voyageDb) {
    return globalForDb.__voyageDb;
  }

  // Try loading from file system (works in local dev)
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data) as DatabaseSchema;
      globalForDb.__voyageDb = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn('[DB] Could not read file, using in-memory store:', (error as Error).message);
  }

  // Initialize fresh database in memory
  const initialDb = getInitialDatabase();
  globalForDb.__voyageDb = initialDb;

  // Try to persist to file (will work locally, silently fail on Vercel)
  tryPersistToFile(initialDb);

  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  // Always save to in-memory store (works everywhere)
  globalForDb.__voyageDb = db;

  // Attempt file persistence (best-effort, non-blocking for Vercel)
  tryPersistToFile(db);
}

function tryPersistToFile(db: DatabaseSchema) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Silently ignore - expected on Vercel's read-only filesystem
  }
}

// User operations
export const dbUsers = {
  findByEmail: (email: string) => {
    const db = loadDatabase();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findById: (id: string) => {
    const db = loadDatabase();
    return db.users.find(u => u.id === id);
  },
  create: (user: UserRecord) => {
    const db = loadDatabase();
    db.users.push(user);
    saveDatabase(db);
    return user;
  },
  update: (id: string, updates: Partial<UserRecord>) => {
    const db = loadDatabase();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates };
    saveDatabase(db);
    return db.users[index];
  },
  listAll: () => {
    const db = loadDatabase();
    return db.users.map(({ passwordHash, ...rest }) => rest);
  }
};

// Trip operations
export const dbTrips = {
  create: (trip: TripSnapshot) => {
    const db = loadDatabase();
    db.trips.unshift(trip);
    if (!db.tripVersions[trip.id]) {
      db.tripVersions[trip.id] = [
        {
          versionNumber: 1,
          timestamp: new Date().toISOString(),
          changeSummary: 'Initial AI-generated itinerary',
          snapshot: JSON.parse(JSON.stringify(trip))
        }
      ];
    }
    db.adminConfig.metrics.totalGenerations += 1;
    saveDatabase(db);
    return trip;
  },
  findById: (id: string) => {
    const db = loadDatabase();
    return db.trips.find(t => t.id === id);
  },
  findByShareId: (shareId: string) => {
    const db = loadDatabase();
    return db.trips.find(t => t.shareId === shareId);
  },
  findByUserId: (userId: string) => {
    const db = loadDatabase();
    return db.trips.filter(t => t.userId === userId);
  },
  listAll: () => {
    const db = loadDatabase();
    return db.trips;
  },
  update: (id: string, updates: Partial<TripSnapshot>, changeSummary?: string) => {
    const db = loadDatabase();
    const index = db.trips.findIndex(t => t.id === id);
    if (index === -1) return null;

    const oldTrip = db.trips[index];
    const newVersion = (oldTrip.version || 1) + (changeSummary ? 1 : 0);
    const updatedTrip: TripSnapshot = {
      ...oldTrip,
      ...updates,
      version: newVersion,
      updatedAt: new Date().toISOString()
    };
    db.trips[index] = updatedTrip;

    if (changeSummary) {
      if (!db.tripVersions[id]) db.tripVersions[id] = [];
      db.tripVersions[id].unshift({
        versionNumber: newVersion,
        timestamp: new Date().toISOString(),
        changeSummary,
        snapshot: JSON.parse(JSON.stringify(updatedTrip))
      });
      db.adminConfig.metrics.totalModifications += 1;
    }

    saveDatabase(db);
    return updatedTrip;
  },
  delete: (id: string) => {
    const db = loadDatabase();
    db.trips = db.trips.filter(t => t.id !== id);
    delete db.tripVersions[id];
    saveDatabase(db);
    return true;
  },
  getVersions: (id: string) => {
    const db = loadDatabase();
    return db.tripVersions[id] || [];
  },
  restoreVersion: (id: string, versionNumber: number) => {
    const db = loadDatabase();
    const versions = db.tripVersions[id] || [];
    const target = versions.find(v => v.versionNumber === versionNumber);
    if (!target) return null;

    const index = db.trips.findIndex(t => t.id === id);
    if (index === -1) return null;

    const restored: TripSnapshot = {
      ...JSON.parse(JSON.stringify(target.snapshot)),
      version: (db.trips[index].version || 1) + 1,
      updatedAt: new Date().toISOString()
    };
    db.trips[index] = restored;

    db.tripVersions[id].unshift({
      versionNumber: restored.version,
      timestamp: new Date().toISOString(),
      changeSummary: `Restored to Version ${versionNumber}`,
      snapshot: JSON.parse(JSON.stringify(restored))
    });

    saveDatabase(db);
    return restored;
  }
};

// AI Conversations
export const dbConversations = {
  getOrInit: (tripId: string, userId?: string) => {
    const db = loadDatabase();
    let conv = db.aiConversations.find(c => c.tripId === tripId);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tripId,
        userId,
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `Hello! I'm your dedicated travel assistant. I've structured this trip based on your preferences, budget, and transit efficiency. You can ask me to modify any part, re-balance the budget, swap hotels, or make a day more relaxed!`,
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      db.aiConversations.push(conv);
      saveDatabase(db);
    }
    return conv;
  },
  appendMessage: (tripId: string, message: { role: 'user' | 'assistant'; content: string; appliedChanges?: any }) => {
    const db = loadDatabase();
    const index = db.aiConversations.findIndex(c => c.tripId === tripId);
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...message,
      timestamp: new Date().toISOString()
    };
    if (index !== -1) {
      db.aiConversations[index].messages.push(newMsg);
      db.aiConversations[index].updatedAt = new Date().toISOString();
    }
    saveDatabase(db);
    return newMsg;
  }
};

// Admin Config & Metrics
export const dbAdmin = {
  getConfig: () => {
    const db = loadDatabase();
    return db.adminConfig;
  },
  updateConfig: (updates: Partial<AdminConfigRecord>) => {
    const db = loadDatabase();
    db.adminConfig = { ...db.adminConfig, ...updates };
    saveDatabase(db);
    return db.adminConfig;
  },
  incrementMetric: (metric: keyof AdminConfigRecord['metrics']) => {
    const db = loadDatabase();
    if (db.adminConfig.metrics[metric] !== undefined) {
      db.adminConfig.metrics[metric] += 1;
      saveDatabase(db);
    }
  }
};
