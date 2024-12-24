export const decoder = (encodedString: string): string | null => {
  try {
    const buffer = Buffer.from(encodedString, "base64");
    const decodedString = buffer.toString("utf-8");
    if (decodedString.includes("\ufffd")) return null;
    return decodedString;
  } catch (error) {
    console.log(error);
    return null;
  }
};
