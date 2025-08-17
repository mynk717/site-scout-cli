import fs from "fs-extra";

export async function saveHtml(filePath, content) {
  try {
    await fs.writeFile(filePath, content);
  } catch (error) {
    console.error(`Error saving HTML to ${filePath}: ${error.message}`);
  }
}
