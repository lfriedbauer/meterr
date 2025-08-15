const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BADGES = {
  EARLY_ADOPTER: {
    id: 'early-adopter',
    icon: '🚀',
    name: 'Early Adopter',
    criteria: 'First to use new low-code tool',
    points: 100,
    check: (stats) => stats.isFirstToUse
  },
  SEARCH_MASTER: {
    id: 'search-master',
    icon: '🔍',
    name: 'Search Master',
    criteria: '10+ FlexSearch implementations',
    points: 200,
    check: (stats) => stats.flexSearchUsage >= 10
  },
  UI_WIZARD: {
    id: 'ui-wizard',
    icon: '🎨',
    name: 'UI Wizard',
    criteria: '20+ v0.dev components',
    points: 200,
    check: (stats) => stats.v0Usage >= 20
  },
  COMPLIANCE_CHAMPION: {
    id: 'compliance-champion',
    icon: '🏆',
    name: 'Compliance Champion',
    criteria: 'Zero violations for 30 days',
    points: 300,
    check: (stats) => stats.violations === 0 && stats.daysSinceLastViolation >= 30
  },
  EFFICIENCY_EXPERT: {
    id: 'efficiency-expert',
    icon: '⚡',
    name: 'Efficiency Expert',
    criteria: '100+ hours saved',
    points: 500,
    check: (stats) => stats.timeSaved >= 100
  },
  TOOL_EVANGELIST: {
    id: 'tool-evangelist',
    icon: '📢',
    name: 'Tool Evangelist',
    criteria: 'Helped 5+ developers adopt tools',
    points: 250,
    check: (stats) => stats.developersHelped >= 5
  },
  PERFECT_WEEK: {
    id: 'perfect-week',
    icon: '✨',
    name: 'Perfect Week',
    criteria: '7 days of 100% compliance',
    points: 150,
    check: (stats) => stats.perfectDays >= 7
  },
  SPEED_DEMON: {
    id: 'speed-demon',
    icon: '🏃',
    name: 'Speed Demon',
    criteria: 'Reduced dev time by 50%+',
    points: 400,
    check: (stats) => stats.timeReductionPercent >= 50
  },
  TEAM_PLAYER: {
    id: 'team-player',
    icon: '🤝',
    name: 'Team Player',
    criteria: 'All PRs compliant for a month',
    points: 200,
    check: (stats) => stats.compliantPRsMonth === stats.totalPRsMonth && stats.totalPRsMonth > 0
  },
  INNOVATION_AWARD: {
    id: 'innovation-award',
    icon: '💡',
    name: 'Innovation Award',
    criteria: 'Created reusable v0.dev template',
    points: 350,
    check: (stats) => stats.templatesCreated > 0
  }
};

const LEVELS = [
  { minScore: 0, name: 'Beginner', icon: '🌱', color: 'green' },
  { minScore: 100, name: 'Practitioner', icon: '📚', color: 'blue' },
  { minScore: 300, name: 'Expert', icon: '⭐', color: 'yellow' },
  { minScore: 600, name: 'Master', icon: '🎯', color: 'orange' },
  { minScore: 1000, name: 'Grandmaster', icon: '👑', color: 'purple' },
  { minScore: 1500, name: 'Legend', icon: '🏅', color: 'gold' }
];

class BadgeSystem {
  constructor() {
    this.dataFile = '.badge-data.json';
    this.leaderboardFile = '.leaderboard.json';
  }
  
  loadData() {
    try {
      return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    } catch {
      return { developers: {} };
    }
  }
  
  saveData(data) {
    fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
  }
  
  getDeveloperStats(developer) {
    const stats = {
      developer,
      flexSearchUsage: this.getFlexSearchCount(developer),
      v0Usage: this.getV0Count(developer),
      violations: this.getViolationCount(developer),
      timeSaved: this.getTimeSaved(developer),
      daysSinceLastViolation: this.getDaysSinceLastViolation(developer),
      developersHelped: this.getDevelopersHelped(developer),
      perfectDays: this.getPerfectDays(developer),
      timeReductionPercent: this.getTimeReductionPercent(developer),
      compliantPRsMonth: this.getCompliantPRsMonth(developer),
      totalPRsMonth: this.getTotalPRsMonth(developer),
      templatesCreated: this.getTemplatesCreated(developer),
      isFirstToUse: this.checkIfFirstToUse(developer)
    };
    
    return stats;
  }
  
  getFlexSearchCount(developer) {
    try {
      const cmd = `git log --author="${developer}" --grep="@flexsearch:" --oneline | wc -l`;
      return parseInt(execSync(cmd, { encoding: 'utf8' }).trim()) || 0;
    } catch {
      return 0;
    }
  }
  
  getV0Count(developer) {
    try {
      const v0Stats = JSON.parse(fs.readFileSync('.v0-stats.json', 'utf8'));
      const devStats = v0Stats.topDevelopers?.find(d => d.name === developer);
      return devStats?.count || 0;
    } catch {
      return 0;
    }
  }
  
  getViolationCount(developer) {
    try {
      const cmd = `git log --author="${developer}" --grep="\\[violation\\]" --oneline | wc -l`;
      return parseInt(execSync(cmd, { encoding: 'utf8' }).trim()) || 0;
    } catch {
      return 0;
    }
  }
  
  getTimeSaved(developer) {
    const flexSearchHours = this.getFlexSearchCount(developer) * 40;
    const v0Hours = this.getV0Count(developer) * 4;
    return flexSearchHours + v0Hours;
  }
  
  getDaysSinceLastViolation(developer) {
    // Simplified: return 30 if no violations
    return this.getViolationCount(developer) === 0 ? 30 : 0;
  }
  
  getDevelopersHelped(developer) {
    // Track through PR reviews or mentoring (simplified)
    return 0; // Would need actual tracking
  }
  
  getPerfectDays(developer) {
    // Track consecutive days without violations (simplified)
    return this.getViolationCount(developer) === 0 ? 7 : 0;
  }
  
  getTimeReductionPercent(developer) {
    const timeSaved = this.getTimeSaved(developer);
    // Assume 160 hours baseline per month
    return Math.round((timeSaved / 160) * 100);
  }
  
  getCompliantPRsMonth(developer) {
    // Would need GitHub API integration
    return 10; // Mock data
  }
  
  getTotalPRsMonth(developer) {
    // Would need GitHub API integration
    return 10; // Mock data
  }
  
  getTemplatesCreated(developer) {
    // Check for v0.dev template files
    return 0; // Would need actual tracking
  }
  
  checkIfFirstToUse(developer) {
    // Check if developer was first to adopt a tool
    return false; // Would need historical data
  }
  
  calculateDeveloperScore(developer) {
    const stats = this.getDeveloperStats(developer);
    const earnedBadges = [];
    let totalScore = 0;
    
    // Check each badge
    for (const [key, badge] of Object.entries(BADGES)) {
      if (badge.check(stats)) {
        earnedBadges.push(badge);
        totalScore += badge.points;
      }
    }
    
    // Calculate base score from activities
    const baseScore = 
      stats.flexSearchUsage * 20 + 
      stats.v0Usage * 15 - 
      stats.violations * 50;
    
    totalScore += Math.max(0, baseScore);
    
    // Determine level
    const level = this.getLevel(totalScore);
    
    return {
      developer,
      score: totalScore,
      earnedBadges,
      level,
      stats,
      nextLevel: this.getNextLevel(totalScore),
      pointsToNextLevel: this.getPointsToNextLevel(totalScore)
    };
  }
  
  getLevel(score) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (score >= LEVELS[i].minScore) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  }
  
  getNextLevel(score) {
    for (const level of LEVELS) {
      if (score < level.minScore) {
        return level;
      }
    }
    return null;
  }
  
  getPointsToNextLevel(score) {
    const nextLevel = this.getNextLevel(score);
    return nextLevel ? nextLevel.minScore - score : 0;
  }
  
  generateLeaderboard() {
    const data = this.loadData();
    const leaderboard = [];
    
    // Get all developers from git log
    try {
      const developers = execSync('git log --format="%aN" | sort -u', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);
      
      for (const developer of developers) {
        const score = this.calculateDeveloperScore(developer);
        leaderboard.push(score);
      }
    } catch {
      console.log('Could not generate leaderboard from git history');
    }
    
    // Sort by score
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Save leaderboard
    fs.writeFileSync(this.leaderboardFile, JSON.stringify(leaderboard, null, 2));
    
    return leaderboard;
  }
  
  displayDeveloperProfile(developer) {
    const profile = this.calculateDeveloperScore(developer);
    
    console.log('\n' + '='.repeat(60));
    console.log(`${profile.level.icon} ${developer}'s Profile`);
    console.log('='.repeat(60));
    
    console.log(`\n📊 Level: ${profile.level.name} ${profile.level.icon}`);
    console.log(`🎯 Score: ${profile.score} points`);
    
    if (profile.nextLevel) {
      console.log(`📈 Next Level: ${profile.nextLevel.name} (${profile.pointsToNextLevel} points needed)`);
      const progress = Math.round(((profile.score - profile.level.minScore) / 
        (profile.nextLevel.minScore - profile.level.minScore)) * 100);
      console.log(`   Progress: ${'█'.repeat(Math.floor(progress/5))}${'░'.repeat(20-Math.floor(progress/5))} ${progress}%`);
    }
    
    console.log('\n🏆 Earned Badges:');
    if (profile.earnedBadges.length > 0) {
      profile.earnedBadges.forEach(badge => {
        console.log(`   ${badge.icon} ${badge.name} (+${badge.points} pts)`);
        console.log(`      ${badge.criteria}`);
      });
    } else {
      console.log('   No badges earned yet. Keep going!');
    }
    
    console.log('\n📈 Statistics:');
    console.log(`   FlexSearch Implementations: ${profile.stats.flexSearchUsage}`);
    console.log(`   v0.dev Components: ${profile.stats.v0Usage}`);
    console.log(`   Time Saved: ${profile.stats.timeSaved} hours`);
    console.log(`   Violations: ${profile.stats.violations}`);
    console.log(`   Compliance Rate: ${profile.stats.violations === 0 ? '100%' : '<100%'}`);
    
    console.log('\n🎯 Available Badges to Earn:');
    const unearned = Object.values(BADGES).filter(badge => 
      !profile.earnedBadges.find(b => b.id === badge.id)
    );
    
    unearned.slice(0, 3).forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} (+${badge.points} pts)`);
      console.log(`      Requirement: ${badge.criteria}`);
    });
    
    console.log('\n' + '='.repeat(60));
  }
  
  displayLeaderboard() {
    const leaderboard = this.generateLeaderboard();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏆 METERR.AI LOW-CODE LEADERBOARD 🏆');
    console.log('='.repeat(60));
    
    leaderboard.slice(0, 10).forEach((entry, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      console.log(`\n${medal} ${entry.developer}`);
      console.log(`   ${entry.level.icon} ${entry.level.name} | ${entry.score} points`);
      console.log(`   Badges: ${entry.earnedBadges.map(b => b.icon).join(' ') || 'None yet'}`);
    });
    
    console.log('\n' + '='.repeat(60));
  }
}

// CLI Interface
if (require.main === module) {
  const badgeSystem = new BadgeSystem();
  const command = process.argv[2];
  const developer = process.argv[3];
  
  switch (command) {
    case 'profile':
      if (developer) {
        badgeSystem.displayDeveloperProfile(developer);
      } else {
        console.log('Usage: node calculate-badges.js profile "Developer Name"');
      }
      break;
      
    case 'leaderboard':
      badgeSystem.displayLeaderboard();
      break;
      
    case 'check':
      if (developer) {
        const score = badgeSystem.calculateDeveloperScore(developer);
        console.log(`${developer}: ${score.score} points (${score.level.name} ${score.level.icon})`);
      }
      break;
      
    case 'badges':
      console.log('\n🏆 Available Badges:\n');
      Object.values(BADGES).forEach(badge => {
        console.log(`${badge.icon} ${badge.name} (${badge.points} points)`);
        console.log(`   ${badge.criteria}\n`);
      });
      break;
      
    case 'levels':
      console.log('\n📊 Levels:\n');
      LEVELS.forEach(level => {
        console.log(`${level.icon} ${level.name} - ${level.minScore}+ points`);
      });
      break;
      
    default:
      console.log('🎮 Meterr.AI Badge System');
      console.log('\nCommands:');
      console.log('  profile <developer>  - Show developer profile and badges');
      console.log('  leaderboard         - Display top developers');
      console.log('  check <developer>   - Quick score check');
      console.log('  badges              - List all available badges');
      console.log('  levels              - Show level progression');
      console.log('\nExample:');
      console.log('  node calculate-badges.js profile "John Doe"');
  }
}

module.exports = BadgeSystem;