const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const PROBLEMS_FILE = path.join(DATA_DIR, 'problems.json');
const CONTESTS_FILE = path.join(DATA_DIR, 'contests.json');

let isMongo = false;

// --- MONGOOSE SCHEMAS & MODELS ---
const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleSlug: { type: String }, // optional for slugging
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: String, required: true }, // e.g., Arrays, Dynamic Programming
  link: { type: String },
  notes: { type: String },
  codeSnippet: { type: String },
  timeSpent: { type: Number }, // in minutes
  runtimeBeats: { type: Number }, // percentage
  memoryBeats: { type: Number }, // percentage
  solvedAt: { type: Date, default: Date.now },
  isMock: { type: Boolean, default: false }
});

const ContestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  solvedCount: { type: Number, required: true },
  rank: { type: Number, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  isMock: { type: Boolean, default: false }
});

let ProblemModel;
let ContestModel;

// --- MOCK DATA FOR SEEDING ---
const mockProblems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    link: "https://leetcode.com/problems/two-sum/",
    notes: "Used a hash map to look up the complement in O(1) time. Single pass solution.",
    codeSnippet: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}",
    timeSpent: 12,
    runtimeBeats: 94.2,
    memoryBeats: 88.5,
    solvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked Lists",
    link: "https://leetcode.com/problems/reverse-linked-list/",
    notes: "Iterative approach with prev, curr, and next pointers. Space complexity O(1).",
    codeSnippet: "function reverseList(head) {\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        let next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}",
    timeSpent: 8,
    runtimeBeats: 98.7,
    memoryBeats: 79.1,
    solvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Strings",
    link: "https://leetcode.com/problems/group-anagrams/",
    notes: "Categorized words by sorted char representation. Used hashmap with sorted string as key.",
    codeSnippet: "function groupAnagrams(strs) {\n    const map = {};\n    for (let str of strs) {\n        const key = str.split('').sort().join('');\n        if (!map[key]) map[key] = [];\n        map[key].push(str);\n    }\n    return Object.values(map);\n}",
    timeSpent: 22,
    runtimeBeats: 85.4,
    memoryBeats: 62.3,
    solvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    notes: "Used sliding window with a Set to track characters in current window. Time O(N).",
    codeSnippet: "function lengthOfLongestSubstring(s) {\n    let max = 0;\n    let left = 0;\n    const set = new Set();\n    for (let right = 0; right < s.length; right++) {\n        while (set.has(s[right])) {\n            set.delete(s[left]);\n            left++;\n        }\n        set.add(s[right]);\n        max = Math.max(max, right - left + 1);\n    }\n    return max;\n}",
    timeSpent: 30,
    runtimeBeats: 91.8,
    memoryBeats: 84.6,
    solvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    title: "LRU Cache",
    difficulty: "Hard",
    category: "Design",
    link: "https://leetcode.com/problems/lru-cache/",
    notes: "Implemented using a doubly linked list + hash map. DLL allows O(1) removal/insertion; hashmap allows O(1) search.",
    codeSnippet: "class Node {\n    constructor(key, val) {\n        this.key = key;\n        this.val = val;\n        this.prev = null;\n        this.next = null;\n    }\n}\n\nclass LRUCache {\n    constructor(capacity) {\n        this.cap = capacity;\n        this.map = new Map();\n        this.head = new Node(0, 0);\n        this.tail = new Node(0, 0);\n        this.head.next = this.tail;\n        this.tail.prev = this.head;\n    }\n    // helper methods to insert and remove...\n}",
    timeSpent: 45,
    runtimeBeats: 92.1,
    memoryBeats: 70.4,
    solvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    notes: "Standard BFS using a queue. Tracked size of queue at each level to push values.",
    codeSnippet: "function levelOrder(root) {\n    if (!root) return [];\n    const res = [], q = [root];\n    while (q.length) {\n        const level = [], len = q.length;\n        for (let i = 0; i < len; i++) {\n            const curr = q.shift();\n            level.push(curr.val);\n            if (curr.left) q.push(curr.left);\n            if (curr.right) q.push(curr.right);\n        }\n        res.push(level);\n    }\n    return res;\n}",
    timeSpent: 15,
    runtimeBeats: 95.9,
    memoryBeats: 92.2,
    solvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    category: "Linked Lists",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    notes: "Used divide and conquer by recursively merging lists in pairs. Time complexity O(N log k).",
    codeSnippet: "function mergeKLists(lists) {\n    if (lists.length === 0) return null;\n    while (lists.length > 1) {\n        let a = lists.shift();\n        let b = lists.shift();\n        let merged = merge2Lists(a, b);\n        lists.push(merged);\n    }\n    return lists[0];\n}",
    timeSpent: 35,
    runtimeBeats: 89.2,
    memoryBeats: 81.3,
    solvedAt: new Date() // Solved today!
  }
];

const mockContests = [
  {
    name: "Weekly Contest 390",
    solvedCount: 3,
    rank: 1204,
    rating: 1650,
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    notes: "Solved Easy and two Mediums. Stumped by the Hard dynamic programming problem."
  },
  {
    name: "Biweekly Contest 128",
    solvedCount: 3,
    rank: 840,
    rating: 1735,
    date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
    notes: "Solid performance. Solved the first 3 tasks quickly. Made a penalty mistake on Q2."
  },
  {
    name: "Weekly Contest 391",
    solvedCount: 4,
    rank: 450,
    rating: 1845,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    notes: "First time solving all 4 problems in a contest! Completed within 72 minutes."
  }
];

// --- STORAGE INITIALIZATION ---
async function init() {
  const mongoUri = process.env.MONGO_URI;
  await fs.ensureDir(DATA_DIR);

  if (mongoUri) {
    try {
      console.log('Attempting to connect to MongoDB at:', mongoUri);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isMongo = true;
      ProblemModel = mongoose.model('Problem', ProblemSchema);
      ContestModel = mongoose.model('Contest', ContestSchema);
      console.log('Successfully connected to MongoDB.');

      // Check if DB is empty and seed
      const pCount = await ProblemModel.countDocuments();
      if (pCount === 0) {
        console.log('MongoDB is empty. Seeding mock data...');
        const problemsWithMockTag = mockProblems.map(p => ({ ...p, isMock: true }));
        const contestsWithMockTag = mockContests.map(c => ({ ...c, isMock: true }));
        await ProblemModel.insertMany(problemsWithMockTag);
        await ContestModel.insertMany(contestsWithMockTag);
        console.log('MongoDB seeding completed.');
      }
      return;
    } catch (err) {
      console.warn('MongoDB connection failed. Error:', err.message);
      console.warn('Falling back to local JSON database storage...');
    }
  } else {
    console.log('No MONGO_URI provided in configuration.');
    console.log('Using local JSON database storage...');
  }

  // Set up local file databases
  isMongo = false;
  if (!await fs.pathExists(PROBLEMS_FILE)) {
    const problemsWithIds = mockProblems.map(p => ({ id: generateId(), isMock: true, ...p }));
    await fs.writeJson(PROBLEMS_FILE, problemsWithIds, { spaces: 2 });
    console.log('Created local problems database with seed data.');
  }
  if (!await fs.pathExists(CONTESTS_FILE)) {
    const contestsWithIds = mockContests.map(c => ({ id: generateId(), isMock: true, ...c }));
    await fs.writeJson(CONTESTS_FILE, contestsWithIds, { spaces: 2 });
    console.log('Created local contests database with seed data.');
  }
}

// Helper to generate unique string ID for JSON fallback
function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// --- PUBLIC METHODS ---

async function getProblems() {
  if (isMongo) {
    return await ProblemModel.find().sort({ solvedAt: -1 });
  } else {
    const list = await fs.readJson(PROBLEMS_FILE);
    // Sort by solvedAt descending
    return list.sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
  }
}

async function saveProblem(problemData) {
  if (isMongo) {
    if (problemData._id) {
      return await ProblemModel.findByIdAndUpdate(problemData._id, problemData, { new: true });
    } else {
      const newProblem = new ProblemModel(problemData);
      return await newProblem.save();
    }
  } else {
    const list = await fs.readJson(PROBLEMS_FILE);
    if (problemData.id) {
      // Update
      const idx = list.findIndex(p => p.id === problemData.id || p._id === problemData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...problemData, solvedAt: problemData.solvedAt || list[idx].solvedAt };
      }
    } else {
      // Create
      const newProblem = {
        id: generateId(),
        ...problemData,
        solvedAt: problemData.solvedAt || new Date().toISOString()
      };
      list.push(newProblem);
    }
    await fs.writeJson(PROBLEMS_FILE, list, { spaces: 2 });
    return problemData;
  }
}

async function deleteProblem(id) {
  if (isMongo) {
    return await ProblemModel.findByIdAndDelete(id);
  } else {
    const list = await fs.readJson(PROBLEMS_FILE);
    const filtered = list.filter(p => p.id !== id && p._id !== id);
    await fs.writeJson(PROBLEMS_FILE, filtered, { spaces: 2 });
    return { success: true };
  }
}

async function getContests() {
  if (isMongo) {
    return await ContestModel.find().sort({ date: -1 });
  } else {
    const list = await fs.readJson(CONTESTS_FILE);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

async function saveContest(contestData) {
  if (isMongo) {
    if (contestData._id) {
      return await ContestModel.findByIdAndUpdate(contestData._id, contestData, { new: true });
    } else {
      const newContest = new ContestModel(contestData);
      return await newContest.save();
    }
  } else {
    const list = await fs.readJson(CONTESTS_FILE);
    if (contestData.id) {
      // Update
      const idx = list.findIndex(c => c.id === contestData.id || c._id === contestData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...contestData, date: contestData.date || list[idx].date };
      }
    } else {
      // Create
      const newContest = {
        id: generateId(),
        ...contestData,
        date: contestData.date || new Date().toISOString()
      };
      list.push(newContest);
    }
    await fs.writeJson(CONTESTS_FILE, list, { spaces: 2 });
    return contestData;
  }
}

async function deleteContest(id) {
  if (isMongo) {
    return await ContestModel.findByIdAndDelete(id);
  } else {
    const list = await fs.readJson(CONTESTS_FILE);
    const filtered = list.filter(c => c.id !== id && c._id !== id);
    await fs.writeJson(CONTESTS_FILE, filtered, { spaces: 2 });
    return { success: true };
  }
}

const PROFILE_FILE = path.join(DATA_DIR, 'leetcode_profile.json');

async function saveLeetcodeProfile(profileData) {
  await fs.writeJson(PROFILE_FILE, profileData, { spaces: 2 });
  return profileData;
}

async function getLeetcodeProfile() {
  if (await fs.pathExists(PROFILE_FILE)) {
    return await fs.readJson(PROFILE_FILE);
  }
  return null;
}

async function clearMockData() {
  if (isMongo) {
    await ProblemModel.deleteMany({ isMock: true });
    await ContestModel.deleteMany({ isMock: true });
  } else {
    if (await fs.pathExists(PROBLEMS_FILE)) {
      const pList = await fs.readJson(PROBLEMS_FILE);
      const filteredP = pList.filter(p => !p.isMock);
      await fs.writeJson(PROBLEMS_FILE, filteredP, { spaces: 2 });
    }
    if (await fs.pathExists(CONTESTS_FILE)) {
      const cList = await fs.readJson(CONTESTS_FILE);
      const filteredC = cList.filter(c => !c.isMock);
      await fs.writeJson(CONTESTS_FILE, filteredC, { spaces: 2 });
    }
  }
}

module.exports = {
  init,
  getProblems,
  saveProblem,
  deleteProblem,
  getContests,
  saveContest,
  deleteContest,
  isMongoConnected: () => isMongo,
  saveLeetcodeProfile,
  getLeetcodeProfile,
  clearMockData
};
