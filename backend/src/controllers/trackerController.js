const db = require('../db/storage');
const leetcodeService = require('../services/leetcodeService');

// Helper to normalize a date to local YYYY-MM-DD string
function toLocalDateString(dateInput) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Compute streak stats
function calculateStreaks(problems) {
  if (!problems || problems.length === 0) {
    return { currentStreak: 0, longestStreak: 0, solvedToday: false, activeDates: [] };
  }

  // Get list of unique dates solved (sorted descending)
  const dateSet = new Set(problems.map(p => toLocalDateString(p.solvedAt)));
  const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));

  const todayStr = toLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterday);

  let currentStreak = 0;
  let solvedToday = dateSet.has(todayStr);

  // Check if streak is active (solved today or yesterday)
  if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
    let checkDate = dateSet.has(todayStr) ? new Date() : yesterday;
    while (true) {
      const checkStr = toLocalDateString(checkDate);
      if (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Sort ascending for forward check
  const sortedDatesAsc = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));
  
  if (sortedDatesAsc.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDatesAsc.length; i++) {
      const prevDate = new Date(sortedDatesAsc[i - 1]);
      const currDate = new Date(sortedDatesAsc[i]);
      
      // Calculate difference in days
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1; // broken, reset to 1
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    solvedToday,
    activeDates: Array.from(dateSet)
  };
}

// Controller Methods

exports.getProblemsList = async (req, res) => {
  try {
    const list = await db.getProblems();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addOrUpdateProblem = async (req, res) => {
  try {
    const problem = await db.saveProblem(req.body);
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeProblem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProblem(id);
    res.json({ success: true, message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContestsList = async (req, res) => {
  try {
    const list = await db.getContests();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addOrUpdateContest = async (req, res) => {
  try {
    const contest = await db.saveContest(req.body);
    res.status(201).json(contest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeContest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteContest(id);
    res.json({ success: true, message: 'Contest deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const problems = await db.getProblems();
    const contests = await db.getContests();

    // Calculate streaks
    const streakStats = calculateStreaks(problems);

    // Totals by difficulty
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let totalTime = 0;
    let totalBeatsRuntime = 0;
    let countBeatsRuntime = 0;

    problems.forEach(p => {
      if (p.difficulty === 'Easy') easyCount++;
      else if (p.difficulty === 'Medium') mediumCount++;
      else if (p.difficulty === 'Hard') hardCount++;

      if (p.timeSpent) totalTime += p.timeSpent;
      if (p.runtimeBeats) {
        totalBeatsRuntime += p.runtimeBeats;
        countBeatsRuntime++;
      }
    });

    const averageBeats = countBeatsRuntime > 0 ? parseFloat((totalBeatsRuntime / countBeatsRuntime).toFixed(1)) : 0;
    const averageTime = problems.length > 0 ? parseFloat((totalTime / problems.length).toFixed(1)) : 0;

    // Get current rating
    const currentRating = contests.length > 0 ? contests[0].rating : 1500; // default initial LeetCode rating is 1500
    const peakRating = contests.length > 0 ? Math.max(...contests.map(c => c.rating)) : 1500;

    // Contribution Heatmap Data for last 365 days
    const contributionMap = {};
    problems.forEach(p => {
      const dateStr = toLocalDateString(p.solvedAt);
      contributionMap[dateStr] = (contributionMap[dateStr] || 0) + 1;
    });

    res.json({
      totalSolved: problems.length,
      easyCount,
      mediumCount,
      hardCount,
      currentStreak: streakStats.currentStreak,
      longestStreak: streakStats.longestStreak,
      solvedToday: streakStats.solvedToday,
      activeDates: streakStats.activeDates,
      averageBeats,
      averageTime,
      currentRating,
      peakRating,
      contributionMap,
      recentProblems: problems.slice(0, 5),
      dbType: db.isMongoConnected() ? 'MongoDB' : 'Local JSON'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAnalyticsStats = async (req, res) => {
  try {
    const problems = await db.getProblems();

    // 1. Difficulty distribution
    const difficultyDist = [
      { name: 'Easy', value: problems.filter(p => p.difficulty === 'Easy').length, color: '#10b981' },
      { name: 'Medium', value: problems.filter(p => p.difficulty === 'Medium').length, color: '#f59e0b' },
      { name: 'Hard', value: problems.filter(p => p.difficulty === 'Hard').length, color: '#ef4444' }
    ];

    // 2. Category tag counts
    const categoryMap = {};
    problems.forEach(p => {
      const cat = p.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryStats = Object.keys(categoryMap).map(name => ({
      name,
      count: categoryMap[name]
    })).sort((a, b) => b.count - a.count);

    // 3. Goal tracking (Problems solved in last 7 days and 30 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const solvedLast7Days = problems.filter(p => new Date(p.solvedAt) >= sevenDaysAgo).length;
    const solvedLast30Days = problems.filter(p => new Date(p.solvedAt) >= thirtyDaysAgo).length;

    // Default goals
    const goals = {
      weeklyTarget: 5,
      weeklyProgress: solvedLast7Days,
      monthlyTarget: 20,
      monthlyProgress: solvedLast30Days
    };

    // 4. Performance trends by difficulty (average time spent, average runtime beats)
    const diffPerformance = ['Easy', 'Medium', 'Hard'].map(diff => {
      const diffProblems = problems.filter(p => p.difficulty === diff);
      const avgTime = diffProblems.length > 0 
        ? parseFloat((diffProblems.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / diffProblems.length).toFixed(1))
        : 0;
      const avgBeats = diffProblems.length > 0
        ? parseFloat((diffProblems.reduce((sum, p) => sum + (p.runtimeBeats || 0), 0) / diffProblems.length).toFixed(1))
        : 0;
      return {
        difficulty: diff,
        avgTime,
        avgBeats,
        count: diffProblems.length
      };
    });

    // 5. Problems solved over time (last 30 days summary by date)
    // Create bucket list of last 10 days with solving history
    const solvedOverTime = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = toLocalDateString(date);
      const count = problems.filter(p => toLocalDateString(p.solvedAt) === dateStr).length;
      
      // Formatting date label as "MMM DD" (e.g. "Jun 19")
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      solvedOverTime.push({ date: dateStr, label, count });
    }

    res.json({
      difficultyDist,
      categoryStats,
      goals,
      diffPerformance,
      solvedOverTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.syncLeetcodeAccount = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const problems = await db.getProblems();
    const contests = await db.getContests();

    // Map existing records to identify duplicates
    const existingProblemTitles = new Set(problems.map(p => p.title.toLowerCase().trim()));
    const existingContestNames = new Set(contests.map(c => c.name.toLowerCase().trim()));

    let problemsSyncedCount = 0;
    let contestsSyncedCount = 0;

    // 1. Fetch recent accepted submissions
    console.log(`Syncing submissions for user ${username}...`);
    const recentSubmissions = await leetcodeService.fetchRecentSubmissions(username);

    // Fetch problem details and save
    for (const sub of recentSubmissions) {
      const normalizedTitle = sub.title.toLowerCase().trim();
      if (!existingProblemTitles.has(normalizedTitle)) {
        try {
          console.log(`Fetching details for question ${sub.titleSlug}...`);
          const details = await leetcodeService.fetchQuestionDetails(sub.titleSlug);
          
          if (details) {
            // Determine category
            let category = 'Algorithms';
            if (details.topicTags && details.topicTags.length > 0) {
              category = details.topicTags[0].name; // e.g. Array, Hash Table
            } else if (details.categoryTitle) {
              category = details.categoryTitle;
            }

            await db.saveProblem({
              title: sub.title,
              titleSlug: sub.titleSlug,
              difficulty: details.difficulty || 'Easy',
              category: category,
              link: `https://leetcode.com/problems/${sub.titleSlug}/`,
              notes: 'Synced automatically from LeetCode profile submissions history.',
              timeSpent: 20, // default placeholder
              runtimeBeats: 85.0, // default placeholder
              memoryBeats: 80.0, // default placeholder
              solvedAt: new Date(sub.timestamp * 1000)
            });
            problemsSyncedCount++;
            existingProblemTitles.add(normalizedTitle);
          }
        } catch (e) {
          console.warn(`Could not sync problem details for ${sub.title}: ${e.message}`);
        }
      }
    }

    // 2. Fetch contest ranking history
    console.log(`Syncing contest history for user ${username}...`);
    const contestHistory = await leetcodeService.fetchContestHistory(username);
    const attendedContests = contestHistory.filter(c => c.attended);

    for (const record of attendedContests) {
      const contestName = record.contest.title;
      const normalizedContestName = contestName.toLowerCase().trim();
      
      if (!existingContestNames.has(normalizedContestName)) {
        await db.saveContest({
          name: contestName,
          solvedCount: record.solvedCount || 0,
          rank: record.ranking || 0,
          rating: Math.round(record.rating) || 1500,
          date: new Date(record.contest.startTime * 1000),
          notes: `Synced automatically from LeetCode contest history. Global rank: #${record.ranking}.`
        });
        contestsSyncedCount++;
        existingContestNames.add(normalizedContestName);
      }
    }

    res.json({
      success: true,
      problemsSyncedCount,
      contestsSyncedCount,
      message: `Successfully synchronized ${problemsSyncedCount} problems and ${contestsSyncedCount} contest logs.`
    });
  } catch (err) {
    console.error('LeetCode sync error:', err);
    res.status(500).json({ error: `LeetCode Sync Failed: ${err.message}` });
  }
};

