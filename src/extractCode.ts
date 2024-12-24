import { decoder } from "./decoder";
import axios from "axios";

export async function request(
  ownerRepo: string,
  path: string,
  token: string
): Promise<any[] | any | Error> {
  try {
    const response = await axios.request({
      url: `http://api.github.com/repos/${ownerRepo}/contents${path}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "MyApp",
      },
    });
    if (response.status !== 200) {
      throw new Error(
        `GitHub API responded with status ${response.status}: ${response.statusText}`
      );
    }
    const data = await response.data;
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(`Error while communicating with GitHub API. ${error}`);
  }
}

export async function extractCode(
  ownerRepo: string,
  data: any[],
  token: string,
  code: Map<string, string> = new Map()
): Promise<Map<string, string> | Error> {
  try {
    await Promise.all(
      data.map(async (item) => {
        if (item.type === "file") {
          const fileData: any = await request(
            ownerRepo,
            "/" + item.path,
            token
          );
          const decodedCode = decoder(fileData.content);
          if (decodedCode) {
            code.set(item.path, decodedCode.trim());
          }
        } else if (item.type === "dir") {
          const dirData = await request(ownerRepo, "/" + item.path, token);
          await extractCode(ownerRepo, dirData, token, code);
        }
      })
    );
    return code;
  } catch (error) {
    console.log(error);
    throw new Error(`${error}`);
  }
}
