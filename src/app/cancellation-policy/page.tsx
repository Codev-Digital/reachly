import PolicyLayout from "@/components/PolicyLayout";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "Cancellation Policy | Reachly",
  description: "Reachly Cancellation Policy.",
};

export default function CancellationPolicyPage() {
  let content = "";
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "files (5)",
      "Reachly-Refund-and-Cancellation-Policy.md",
    );
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read Cancellation Policy markdown file:", err);
  }

  return (
    <PolicyLayout
      title="Cancellation Policy"
      lastUpdated="July 9, 2026"
      markdownContent={content}
    />
  );
}
