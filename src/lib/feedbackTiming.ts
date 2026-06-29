/** How long the green success popup / banner stays visible. */
export const CORRECT_FEEDBACK_MS = 2000;

/** How long wrong-answer popup stays visible — match success so kids notice it. */
export const WRONG_FEEDBACK_MS = 2000;

/** Wait before unlocking after a wrong answer (popup fade + brief beat). */
export const WRONG_UNLOCK_MS = WRONG_FEEDBACK_MS + 200;

/** Wait before advancing after a correct answer (popup fade + brief beat). */
export const CORRECT_ADVANCE_MS = CORRECT_FEEDBACK_MS + 200;
