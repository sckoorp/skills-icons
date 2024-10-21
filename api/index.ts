import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

const api = express();

api.use(express.static(path.join(__dirname, "../icons")));
api.use(express.json());

api.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ dev: "https://github.com/sckoorp" });
});

const shortnames: Record<string, string> = {
    js: "javascript",
    ts: "typescript"
}

api.get("/icons", async (_req: Request, res: Response) => {
    const { i } = _req.query;
    if (i && typeof i === "string") {
        const iconslist = i.split(",");
        const fulliconslist = iconslist.map(icon => shortnames[icon.trim()] || icon.trim());
        const data: string[] = [];
        const idir = path.join(__dirname, "../icons");

        for (const icon of fulliconslist) {
            const ipath = path.join(idir, `${icon.trim()}.svg`);
            try {
                const content = await fs.readFile(ipath, "utf-8");
                data.push(content);
            } catch (error) {
                console.warn(`Can't find "${icon.trim()}" icon`);
            }
        }

        if (data.length === 0) {
            return res.status(404).json({ message: "No valid icons found." });
        }

        const length = Math.min(15 * 300, data.length * 300) - 44;
        const height = Math.ceil(data.length / 15) * 300 - 44;
        const scaledHeight = height * (48 / (300 - 44));
        const scaledWidth = length * (48 / (300 - 44));

        const response = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${length} ${height}" 
            fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
            ${data.map((icon, index) => `
                <g transform="translate(${(index % 15) * 300}, ${Math.floor(index / 15) * 300})">
                    ${icon}
                </g>`).join(" ")}
            </svg>`;

        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send(response);
    } else {
        res.status(400).json({ message: "You didn't specify any icon!" });
    }
});

api.get("/icons/all", async (_req: Request, res: Response) => {
    const idir = path.join(__dirname, "../icons");

    try {
        const files = await fs.readdir(idir);
        const svgs = files.filter(file => file.endsWith(".svg"));

        const data: string[] = [];

        for (const file of svgs) {
            const fpath = path.join(idir, file);
            const content = await fs.readFile(fpath, "utf-8");
            data.push(content);
        }

        if (data.length === 0) {
            return res.status(404).json({ message: "No SVG icons found." });
        }

        const length = Math.min(15 * 300, data.length * 300) - 44;
        const height = Math.ceil(data.length / 15) * 300 - 44;
        const scaledHeight = height * (48 / (300 - 44));
        const scaledWidth = length * (48 / (300 - 44));

        const response = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${length} ${height}" 
            fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
            ${data.map((icon, index) => `
                <g transform="translate(${(index % 15) * 300}, ${Math.floor(index / 15) * 300})">
                    ${icon}
                </g>`).join(" ")}
            </svg>`;

        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send(response);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

api.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route Not Found" });
});

api.listen(3000, () => console.log("Ready & Listening..."));

export default api;