#!/usr/bin/env node

/**
 * Fetch GitHub repositories and generate projects.json
 * This script is run by GitHub Actions to automatically update the featured projects list
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const USERNAME = 'Chriszhang6';
const OUTPUT_FILE = path.join(__dirname, '../../projects.json');

// GitHub API endpoint for user repositories
const REPOS_API = `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner&sort=updated`;

/**
 * Make an HTTPS request with proper headers
 */
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'GitHub-Actions-Update-Projects',
        'Accept': 'application/vnd.github.v3+json',
        ...headers
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Check if a repository has GitHub Pages enabled
 * This uses the GitHub Pages API which requires authentication
 */
async function hasGitHubPagesAPI(repoName, token) {
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const pagesInfo = await httpsGet(
      `https://api.github.com/repos/${USERNAME}/${repoName}/pages`,
      headers
    );
    // The API returns pages info if it exists
    return !!pagesInfo;
  } catch (error) {
    // 404 means no Pages configured
    return false;
  }
}

/**
 * Try to fetch the potential GitHub Pages URL to see if it exists
 * This is a fallback method that doesn't require API access
 */
async function testPagesURL(repoName) {
  return new Promise((resolve) => {
    const pagesUrl = `https://${USERNAME}.github.io/${repoName}/`;

    const options = {
      method: 'HEAD',
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'GitHub-Actions-Update-Projects'
      }
    };

    const req = https.get(pagesUrl, options, (res) => {
      // Any success response (2xx, 3xx) means the page exists
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Check if a repository is likely to have GitHub Pages
 * Based on common naming patterns
 */
function likelyHasPages(repo) {
  // Check repository name patterns commonly used for GitHub Pages
  const pagesPatterns = [
    /\.github\.io$/,           // Main pages repo
    /-homepage$/,              // Common suffix
    /-portfolio$/,             // Portfolio sites
    /-website$/,               // Website repos
    /-site$/,                  // Site repos
    /^space_invader/,          // Known project
    /^2025$/,                  // Known project
  ];

  return pagesPatterns.some(pattern => pattern.test(repo.name));
}

/**
 * Format repository data for the projects.json file
 */
function formatProjectData(repo) {
  // Determine the Pages URL
  let pagesUrl;
  if (repo.name.includes(`${USERNAME}.github.io`)) {
    pagesUrl = `https://${USERNAME}.github.io/`;
  } else {
    pagesUrl = `https://${USERNAME}.github.io/${repo.name}/`;
  }

  return {
    name: repo.name,
    description: repo.description || 'A GitHub project',
    url: pagesUrl,
    github: repo.html_url,
    language: repo.language || 'Various',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    createdAt: repo.created_at,
    topics: repo.topics || []
  };
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔄 Fetching GitHub repositories...');

  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    // Fetch all repositories
    const repos = await httpsGet(REPOS_API, headers);
    console.log(`✅ Found ${repos.length} repositories`);

    // Log all repo names for debugging
    console.log(`📋 All repositories:`, repos.map(r => r.name).join(', '));

    // Filter and process repositories
    const projects = [];

    for (const repo of repos) {
      // Skip forks and archived repos
      if (repo.fork || repo.archived) {
        console.log(`  ⊝ Skipping ${repo.name} (fork=${repo.fork}, archived=${repo.archived})`);
        continue;
      }

      console.log(`  🔍 Checking ${repo.name}...`);

      // Check if repo has GitHub Pages
      let hasPages = false;
      let detectionMethod = '';

      // Method 1: Try GitHub Pages API (requires token)
      if (token) {
        try {
          hasPages = await hasGitHubPagesAPI(repo.name, token);
          detectionMethod = hasPages ? 'API' : 'API (not found)';
        } catch (e) {
          detectionMethod = `API error: ${e.message}`;
        }
        console.log(`    API check: ${detectionMethod}`);
      }

      // Method 2: Test URL directly (more reliable for some repos)
      if (!hasPages) {
        try {
          hasPages = await testPagesURL(repo.name);
          detectionMethod = hasPages ? 'URL test' : 'URL test (not found)';
        } catch (e) {
          detectionMethod = `URL test error: ${e.message}`;
        }
        console.log(`    URL test: ${detectionMethod}`);
      }

      // Method 3: Check naming patterns (last resort)
      if (!hasPages && likelyHasPages(repo)) {
        hasPages = true;
        detectionMethod = 'Pattern match';
        console.log(`    Pattern match: ✓`);
      }

      if (hasPages) {
        const project = formatProjectData(repo);
        projects.push(project);
        console.log(`  ✅ ${repo.name} - ADDED (${detectionMethod})`);
      } else {
        console.log(`  ⊘ ${repo.name} - Skipped (no Pages)`);
      }
    }

    // Sort by stars (descending) and then by updated date
    projects.sort((a, b) => {
      if (b.stars !== a.stars) {
        return b.stars - a.stars;
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    // Write to projects.json
    const outputPath = path.resolve(OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2), 'utf8');

    console.log(`\n✨ Successfully updated ${projects.length} projects in projects.json`);
    console.log(`📁 Output: ${outputPath}`);

    // Log summary
    if (projects.length > 0) {
      console.log('\n📊 Project Summary:');
      projects.forEach(p => {
        console.log(`  - ${p.name} (${p.language}, ⭐ ${p.stars})`);
        console.log(`    ${p.url}`);
      });
    } else {
      console.log('\n⚠️  No projects found with GitHub Pages enabled.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
