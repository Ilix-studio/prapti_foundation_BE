import axios from "axios";
import logger from "../utils/logger";

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export const verifyRecaptcha = async (
  token: string,
  expectedAction: string = "volunteer_application"
): Promise<{ success: boolean; score?: number; message?: string }> => {
  try {
    const response = await axios.post<RecaptchaResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const { success, score, action, hostname } = response.data;

    if (!success) {
      return {
        success: false,
        message: "reCAPTCHA verification failed",
      };
    }

    // Score check (v3 specific)
    const SCORE_THRESHOLD = 0.5;
    if (score !== undefined && score < SCORE_THRESHOLD) {
      logger.warn(`Low reCAPTCHA score: ${score}`);
      return {
        success: false,
        score,
        message: "Bot-like activity detected",
      };
    }

    // Action verification
    if (action && action !== expectedAction) {
      logger.warn(
        `Action mismatch: expected '${expectedAction}', got '${action}'`
      );
      return {
        success: false,
        message: "Invalid reCAPTCHA action",
      };
    }

    // Optional: hostname verification
    // if (hostname && !['your-domain.com', 'localhost'].includes(hostname)) {
    //   return { success: false, message: "Invalid hostname" };
    // }

    return { success: true, score };
  } catch (error) {
    logger.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      message: "Server error during verification",
    };
  }
};
