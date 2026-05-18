export type AIProviderInfo = {
  label: string;
  title: string;
  tone: "local" | "offline";
};

export function getAIProviderInfo(provider: string): AIProviderInfo {
  if (provider === "ollama") {
    return {
      label: "On-device",
      title: "Generated with on-device AI",
      tone: "local",
    };
  }
  return {
    label: "Built-in",
    title: "Generated with built-in assist",
    tone: "offline",
  };
}
