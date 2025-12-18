#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import dotenv from "dotenv";
import {
  createProjectFromTemplate,
  ProjectFromTemplateInput,
  LinearError,
  validateLinearEnv,
} from "../../lib/linear/createIssue";

dotenv.config();
const envLocal = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: false });
}

const rl = createInterface({
  input: stdin,
  output: stdout,
});

async function ask(prompt: string): Promise<string> {
  const answer = await rl.question(`${prompt.trim()} `);
  return answer.trim();
}

async function confirm(prompt: string): Promise<boolean> {
  const result = await ask(`${prompt} (y/n)`);
  const normalized = result.toLowerCase();
  return normalized === "y" || normalized === "yes";
}

async function main() {
  try {
    validateLinearEnv();

    console.log("📋 Create Project from Template\n");

    const name = await ask("Project name:");
    if (!name) {
      console.error("Project name is required.");
      process.exit(1);
    }

    const templateId = await ask("Template ID:");
    if (!templateId) {
      console.error("Template ID is required.");
      process.exit(1);
    }

    const teamId = await ask(
      `Team ID (leave empty for default: ${process.env.LINEAR_TEAM_ID}):`,
    );
    const leadId = await ask("Lead ID (optional):");
    const targetDate = await ask("Target date (YYYY-MM-DD, optional):");
    const description = await ask("Description (optional):");

    const input: ProjectFromTemplateInput = {
      name,
      templateId,
    };

    if (teamId) input.teamId = teamId;
    if (leadId) input.leadId = leadId;
    if (targetDate) input.targetDate = targetDate;
    if (description) input.description = description;

    console.log("\n📝 Project details:");
    console.log(`   Name: ${input.name}`);
    console.log(`   Template: ${input.templateId}`);
    if (input.teamId) console.log(`   Team: ${input.teamId}`);
    if (input.leadId) console.log(`   Lead: ${input.leadId}`);
    if (input.targetDate) console.log(`   Target: ${input.targetDate}`);
    if (input.description) console.log(`   Description: ${input.description}`);

    const shouldCreate = await confirm("\nCreate project?");
    if (!shouldCreate) {
      console.log("Cancelled.");
      process.exit(0);
    }

    console.log("\n⏳ Creating project...");
    const project = await createProjectFromTemplate(input);

    console.log("\n✅ Project created successfully!");
    console.log(`   ID: ${project.id}`);
    console.log(`   Name: ${project.name}`);
    console.log(`   URL: ${project.url}`);
  } catch (error) {
    if (error instanceof LinearError) {
      console.error(`\n❌ Linear Error: ${error.message}`);
    } else {
      console.error("\n❌ Error:", (error as Error).message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
