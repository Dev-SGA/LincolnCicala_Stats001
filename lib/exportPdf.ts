/** 16:9 slide in CSS pixels; must match `.stats-pdf` in globals.css. */
export const PDF_SLIDE_WIDTH = 1280;
export const PDF_SLIDE_HEIGHT = 720;

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

/** html2canvas cannot parse modern color functions (e.g. color-mix) from global styles. */
function collectPdfSlideCssForExport(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        const text = rule.cssText;
        if (
          !text.includes("color-mix(") &&
          (text.includes(".stats-pdf") || text.includes(".spdf-") || text.includes(".stats-pdf-host"))
        ) {
          chunks.push(text);
        }
      }
    } catch {
      /* Cross-origin or inaccessible stylesheet */
    }
  }
  return chunks.join("\n");
}

/** Background images are not covered by waitForImages, so preload them explicitly. */
async function preloadBackgrounds(element: HTMLElement): Promise<void> {
  const urls = Array.from(element.querySelectorAll<HTMLElement>("[data-pdf-bg]"))
    .map((node) => node.dataset.pdfBg ?? "")
    .filter(Boolean);
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );
}

export async function exportStatsSlideToPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  await Promise.all([waitForImages(element), preloadBackgrounds(element)]);
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const sheetRect = element.getBoundingClientRect();
  const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[data-pdf-link]"))
    .map((node) => ({
      url: node.dataset.pdfLink || node.href,
      rect: node.getBoundingClientRect(),
    }))
    .filter((link) => link.url.startsWith("http"));

  const pdfSlideCss = collectPdfSlideCssForExport();

  const canvas = await html2canvas(element, {
    scale: 2.5,
    width: PDF_SLIDE_WIDTH,
    height: PDF_SLIDE_HEIGHT,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: (clonedDoc) => {
      // Font stylesheets are cross-origin and safe for html2canvas; only app CSS carries color-mix.
      clonedDoc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
        if (new URL(link.href, window.location.href).origin === window.location.origin) link.remove();
      });
      clonedDoc.querySelectorAll("style").forEach((node) => node.remove());
      const style = clonedDoc.createElement("style");
      style.textContent = pdfSlideCss;
      clonedDoc.head.appendChild(style);
    },
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [PDF_SLIDE_WIDTH, PDF_SLIDE_HEIGHT],
    hotfixes: ["px_scaling"],
    compress: true,
  });

  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, PDF_SLIDE_WIDTH, PDF_SLIDE_HEIGHT);

  for (const link of links) {
    pdf.link(link.rect.left - sheetRect.left, link.rect.top - sheetRect.top, link.rect.width, link.rect.height, {
      url: link.url,
    });
  }

  pdf.save(filename);
}
