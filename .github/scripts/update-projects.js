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
 */
async function hasGitHubPages(repoName, token) {
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const pagesInfo = await httpsGet(
      `https://api.github.com/repos/${USERNAME}/${repoName}/pages`,
      headers
    );
    return pagesInfo && pagesInfo.status === 'built';
  } catch (error) {
    // If we get a 404, it means Pages is not configured
    return false;
  }
}

/**
 * Check if a repository is likely to have Pages by checking common indicators
 */
function likelyHasPages(repo) {
  // Check if repo has a gh-pages branch indicator or common Pages files
  const indicators = [
    'index.html',
    'README.md'
  ];

  // Check repository name patterns
  const pagesPatterns = [
    /\.github\.io$/,
    /-homepage$/,
    /-portfolio$/,
    /-website$/,
    /-site$/
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

    // Filter and process repositories
    const projects = [];

    for (const repo of repos) {
      // Skip forks and archived repos
      if (repo.fork || repo.archived) {
        continue;
      }

      // Check if repo has GitHub Pages
      let hasPages = false;

      // First, try to check via API (requires token)
      if (token) {
        hasPages = await hasGitHubPages(repo.name, token);
      }

      // Fallback: check if it's likely to have Pages based on name patterns
      if (!hasPages && likelyHasPages(repo)) {
        hasPages = true;
      }

      // Also check if it's the main GitHub Pages repo
      if (repo.name === `${USERNAME}.github.io`) {
        hasPages = true;
      }

      if (hasPages) {
        const project = formatProjectData(repo);
        projects.push(project);
        console.log(`  ✓ ${repo.name} - ${repo.description?.substring(0, 50) || 'No description'}`);
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
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
