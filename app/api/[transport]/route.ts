import { createConsultingMcpHandler } from "@/nextjs-app/shared/lib/mcp/create-consulting-mcp-handler";

export const runtime = "nodejs";
export const maxDuration = 60;

const { handleMcpRequest } = createConsultingMcpHandler({ basePath: "/api" });

export { handleMcpRequest as GET, handleMcpRequest as POST, handleMcpRequest as DELETE };
