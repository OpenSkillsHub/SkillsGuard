/**
 * Skills Guard - Skill Parser
 * Parse Agent Skills specification SKILL.md files
 */

import * as yaml from 'yaml';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Skill, ScriptFile, ReferenceFile, SkillFrontmatter } from './types.js';

/**
 * Parse Skill directory or single SKILL.md file
 */
export async function parseSkill(input: string): Promise<Skill> {
  const stat = await fs.stat(input);

  if (stat.isDirectory()) {
    return parseSkillDirectory(input);
  } else {
    return parseSkillFile(input);
  }
}

/**
 * Parse Skill directory
 */
async function parseSkillDirectory(dirPath: string): Promise<Skill> {
  const skillMdPath = path.join(dirPath, 'SKILL.md');
  const skill = await parseSkillFile(skillMdPath);
  skill.path = dirPath;

  // Parse optional directories
  skill.directories = {
    scripts: await parseScriptsDir(path.join(dirPath, 'scripts')),
    references: await parseReferencesDir(path.join(dirPath, 'references')),
    assets: await listAssets(path.join(dirPath, 'assets')),
  };

  return skill;
}

/**
 * Parse single SKILL.md file
 */
async function parseSkillFile(filePath: string): Promise<Skill> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseSkillContent(content, filePath);
}

/**
 * Parse SKILL.md content
 */
export function parseSkillContent(content: string, filePath: string = 'SKILL.md'): Skill {
  const skill: Skill = {
    path: filePath,
    frontmatter: {
      name: '',
      description: '',
    },
    body: '',
    raw: content,
  };

  // 1. Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatterMatch) {
    try {
      const fm = yaml.parse(frontmatterMatch[1]) as Record<string, unknown>;
      skill.frontmatter = {
        name: (fm.name as string) || '',
        description: (fm.description as string) || '',
        license: fm.license as string | undefined,
        compatibility: fm.compatibility as string | undefined,
        metadata: fm.metadata as Record<string, string> | undefined,
        // allowed-tools is a space-separated string
        allowedTools: parseAllowedTools(fm['allowed-tools'] as string | undefined),
      };
    } catch (e) {
      // YAML parse error, keep original content for later detection
      skill.frontmatter._parseError = String(e);
    }

    // Extract body (content after frontmatter)
    skill.body = content.slice(frontmatterMatch[0].length).trim();
  } else {
    // No frontmatter, entire content as body
    skill.body = content;
    skill.frontmatter._noFrontmatter = true;
  }

  return skill;
}

/**
 * Parse allowed-tools string
 * Format: space-separated, e.g., "Bash(git:*) Bash(jq:*) Read"
 */
function parseAllowedTools(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  
  // Use regex to match, handle tool names with parentheses
  const tools: string[] = [];
  const regex = /(\w+(?:\([^)]*\))?)/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    tools.push(match[1]);
  }
  return tools.length > 0 ? tools : undefined;
}

/**
 * Parse scripts/ directory
 */
async function parseScriptsDir(dirPath: string): Promise<ScriptFile[]> {
  try {
    const files = await fs.readdir(dirPath);
    const scripts: ScriptFile[] = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        const content = await fs.readFile(filePath, 'utf-8');
        scripts.push({
          path: `scripts/${file}`,
          content,
          language: detectScriptLanguage(file),
        });
      }
    }

    return scripts;
  } catch {
    return [];
  }
}

function detectScriptLanguage(filename: string): ScriptFile['language'] {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.sh') || filename.endsWith('.bash')) return 'bash';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return 'javascript';
  return 'unknown';
}

/**
 * Parse references/ directory
 */
async function parseReferencesDir(dirPath: string): Promise<ReferenceFile[]> {
  try {
    const files = await fs.readdir(dirPath);
    const refs: ReferenceFile[] = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        refs.push({
          path: `references/${file}`,
          content,
        });
      }
    }

    return refs;
  } catch {
    return [];
  }
}

async function listAssets(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.map((f: string) => `assets/${f}`);
  } catch {
    return [];
  }
}

// Extend frontmatter type to support parse errors
declare module './types.js' {
  interface SkillFrontmatter {
    _parseError?: string;
    _noFrontmatter?: boolean;
  }
}
