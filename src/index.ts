import express, { Request, Response } from "express";
import "dotenv/config";
import { TExtract } from "./types";
import { extractCode, request } from "./extractCode";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.post("/api/extract", async (req: Request, res: Response) => {
  try {
    const { path, url, token, skipPaths }: TExtract = req.body;
    const ownerRepo = url.replace("https://github.com/", "");
    const data = await request(ownerRepo, path, token);
    const results: Map<string, string> | Error = await extractCode(
      ownerRepo,
      data,
      token,
      skipPaths
    );
    if (results instanceof Error) {
      throw new Error(results.message);
    }
    res.status(200).json({
      success: true,
      message: "code extracted successfully",
      data: Array.from(results.entries()),
    });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "internal server error";
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
