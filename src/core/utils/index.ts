
import crypto from "crypto";
export const uuidv4 = (): string => crypto.randomBytes(16).toString("hex");

export { FileHelper } from "./FileHelper";
export { SpeedFormatter } from "./SpeedFormatter";
