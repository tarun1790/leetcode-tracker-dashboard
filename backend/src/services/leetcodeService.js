// Service to fetch public LeetCode user data using GraphQL
const API_URL = 'https://leetcode.com/graphql';

async function graphqlCall(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://leetcode.com'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LeetCode API returned HTTP ${response.status}: ${text}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

// 1. Fetch recent accepted submissions
async function fetchRecentSubmissions(username, limit = 15) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;
  const data = await graphqlCall(query, { username, limit });
  return data.recentAcSubmissionList || [];
}

// 2. Fetch specific question metadata
async function fetchQuestionDetails(titleSlug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
        categoryTitle
        topicTags {
          name
        }
      }
    }
  `;
  const data = await graphqlCall(query, { titleSlug });
  return data.question;
}

// 3. Fetch contest ranking history
async function fetchContestHistory(username) {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        solvedCount
        totalProblems
        contest {
          title
          startTime
        }
      }
    }
  `;
  const data = await graphqlCall(query, { username });
  return data.userContestRankingHistory || [];
}

module.exports = {
  fetchRecentSubmissions,
  fetchQuestionDetails,
  fetchContestHistory
};
