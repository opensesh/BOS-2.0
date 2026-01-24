'use server';

import fs from 'fs/promises';
import path from 'path';

const SKILLS_DIR = path.join(process.cwd(), '.claude/skills');

export async function getSkillContent(skillId: string) {
  try {
    // Handle special case for 'public' skill or nested skills if needed
    // For now assuming flat structure based on directory listing
    const skillPath = path.join(SKILLS_DIR, skillId, 'SKILL.md');
    
    // specific check for internal-comms if it uses README, but listing showed SKILL.md
    
    const content = await fs.readFile(skillPath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading skill ${skillId}:`, error);
    return `Error loading skill content. Please ensure .claude/skills/${skillId}/SKILL.md exists.`;
  }
}

