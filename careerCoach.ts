import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";

interface GoalContext {
  pathways: string[];
  support: string[];
  focus: string;
}

export interface Recommendation {
  id: string;
  title: string;
  duration: string;
  description: string;
}

const guidanceSchema = z.object({
  id: z.string(),
  description: z.string(),
  guidance: z.string()
});

const endpoint = process.env.CAREER_COACH_MCP_URL ?? "https://mcp.aicareercoach.org/mcp/";

function selectTopicIds(goal: GoalContext): [string, string] {
  const focus = `${goal.pathways.join(" ")} ${goal.focus}`.toLowerCase();
  let primary = "explore_career_paths";

  if (focus.includes("resume")) primary = "build_a_resume";
  else if (focus.includes("interview")) primary = "preparing_for_a_job_interview";
  else if (focus.includes("college") || focus.includes("major") || focus.includes("school")) primary = "choose_your_college_major";
  else if (focus.includes("job")) primary = "find_a_job_to_apply_to";
  else if (focus.includes("transition") || focus.includes("new field")) primary = "translate_experience_to_new_field";

  const support = goal.support.join(" ").toLowerCase();
  let secondary = "the_art_of_following_up";
  if (support.includes("practice")) secondary = "networking_basics";
  else if (support.includes("feedback")) secondary = "identify_strengths_and_weaknesses";
  else if (support.includes("accountability") || support.includes("task")) secondary = "time_management_and_prioritization";
  else if (support.includes("encouragement")) secondary = "imposter_syndrome";
  else if (support.includes("resource")) secondary = "prepare_for_a_career_skills";

  return primary === secondary ? [primary, "the_art_of_following_up"] : [primary, secondary];
}

function titleFromGuidance(guidance: string, topicId: string): string {
  return guidance.match(/^#\s+(.+)$/m)?.[1]?.trim()
    ?? topicId.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

export async function getCareerCoachRecommendations(goal: GoalContext): Promise<Recommendation[]> {
  const client = new Client({ name: "college-career-agent-poc", version: "0.1.0" });

  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
    const recommendations: Recommendation[] = [];

    for (const topicId of selectTopicIds(goal)) {
      const result = await client.callTool({
        name: "GetCareerCoachingGuidance",
        arguments: { topic_id: topicId }
      });
      const guidance = guidanceSchema.parse(result.structuredContent);
      recommendations.push({
        id: guidance.id,
        title: titleFromGuidance(guidance.guidance, guidance.id),
        duration: "15-20 min",
        description: guidance.description
      });
    }

    return recommendations;
  } finally {
    await client.close();
  }
}