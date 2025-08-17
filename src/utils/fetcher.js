import axios from "axios";
import fs from "fs-extra";
import path from "path";

// Fetches the HTML content of a page
export async function fetchHtml(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "SiteScout/1.0" },
    });
    return data;
  } catch (error) {
    console.error(`Error fetching HTML from ${url}: ${error.message}`);
    return null;
  }
}

// Downloads a single asset (like an image)
export async function downloadAsset(url, localPath) {
  const dir = path.dirname(localPath);
  await fs.ensureDir(dir); // Ensure the directory exists

  const writer = fs.createWriteStream(localPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: { "User-Agent": "SiteScout/1.0" },
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
