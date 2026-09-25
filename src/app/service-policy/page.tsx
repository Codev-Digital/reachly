import PolicyLayout from "@/components/PolicyLayout";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "Shipping Policy | Reachly",
  description: "Reachly Shipping Policy for digital video sessions.",
};

export default function ServicePolicyPage() {
  let content = "";
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "files (5)",
      "Reachly-Service-Policy.md",
    );
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read Service Policy markdown file:", err);
  }

  return (
    <PolicyLayout
      title="Shipping Policy"
      lastUpdated="July 9, 2026"
      markdownContent={content}
    />
  );
}
