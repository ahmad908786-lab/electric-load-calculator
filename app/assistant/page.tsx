import type { Metadata } from "next";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export const metadata: Metadata = {
  title: "AI Assistant — Ask the Code",
  description: "A ChatGPT-style assistant for the Canadian Electrical Code. Ask any question and get an answer with the exact CEC rule cited.",
};

export default function AssistantPage() {
  return <AssistantChat />;
}
