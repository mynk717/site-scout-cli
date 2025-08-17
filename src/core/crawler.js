import { URL } from "url";

export class Crawler {
  constructor(startUrl, depth) {
    this.startUrl = new URL(startUrl);
    this.maxDepth = depth;
    this.queue = [{ url: startUrl, depth: 0 }];
    this.visited = new Set([startUrl]);
    this.manifest = {
      startUrl: startUrl,
      clonedAt: new Date().toISOString(),
      resources: {},
    };
  }

  addToQueue(url, currentDepth) {
    if (currentDepth < this.maxDepth) {
      const newUrl = new URL(url, this.startUrl.href).href;
      // Only crawl same-origin URLs and haven't visited
      if (
        new URL(newUrl).origin === this.startUrl.origin &&
        !this.visited.has(newUrl)
      ) {
        this.visited.add(newUrl);
        this.queue.push({ url: newUrl, depth: currentDepth + 1 });
      }
    }
  }

  addResource(originalUrl, localPath, type) {
    this.manifest.resources[originalUrl] = { localPath, type };
  }

  getNext() {
    return this.queue.shift();
  }

  hasItems() {
    return this.queue.length > 0;
  }
}
