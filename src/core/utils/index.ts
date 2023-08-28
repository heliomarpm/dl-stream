import { FileHelper } from "./FileHelper";
import { SpeedFormatter } from "./SpeedFormatter";

import crypto from "crypto";
export const uuidv4 = (): string => crypto.randomBytes(16).toString("hex");

export {FileHelper, SpeedFormatter};
