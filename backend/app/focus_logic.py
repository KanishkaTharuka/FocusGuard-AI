
import time

from app.config import PHONE_DISTRACTION_SECONDS


class FocusDecisionEngine:

    def __init__(self):

        # Time when the current phone-detection session started
        self.phone_start_time = None

        # Number of consecutive frames where
        # the phone was NOT detected
        self.phone_missed_frames = 0

        # Allow a few missed detections before
        # resetting the timer
        self.max_phone_missed_frames = 3

    def get_status(self, person_detected, phone_detected):

        current_time = time.time()

        # -----------------------------------------
        # CASE 1: Person is NOT detected
        # -----------------------------------------

        if not person_detected:

            self.phone_start_time = None
            self.phone_missed_frames = 0

            return {
                "status": "Away Mode",
                "duration": 0
            }

        # -----------------------------------------
        # CASE 2: Person + Phone detected
        # -----------------------------------------

        if phone_detected:

            # Phone detected again.
            # Reset missed-frame counter.
            self.phone_missed_frames = 0

            # Start a new phone session
            # if one does not already exist.
            if self.phone_start_time is None:

                self.phone_start_time = current_time

            duration = current_time - self.phone_start_time

            # -------------------------------------
            # Phone detected for long enough
            # -------------------------------------

            if duration >= PHONE_DISTRACTION_SECONDS:

                return {
                    "status": "Digital Distraction Detected",
                    "duration": round(duration, 1)
                }

            # -------------------------------------
            # Phone detected but threshold
            # has not been reached yet
            # -------------------------------------

            return {
                "status": "Focused Working",
                "duration": round(duration, 1)
            }

        # -----------------------------------------
        # CASE 3: Person detected
        #         but phone NOT detected
        # -----------------------------------------

        self.phone_missed_frames += 1

        # -----------------------------------------
        # Temporary YOLO detection failure
        # -----------------------------------------

        if (
            self.phone_start_time is not None
            and self.phone_missed_frames < self.max_phone_missed_frames
        ):

            duration = current_time - self.phone_start_time

            if duration >= PHONE_DISTRACTION_SECONDS:

                return {
                    "status": "Digital Distraction Detected",
                    "duration": round(duration, 1)
                }

            return {
                "status": "Focused Working",
                "duration": round(duration, 1)
            }

        # -----------------------------------------
        # Phone has been missing for too long
        # -----------------------------------------

        self.phone_start_time = None
        self.phone_missed_frames = 0

        return {
            "status": "Focused Working",
            "duration": 0
        }


# Create ONE decision engine instance
focus_engine = FocusDecisionEngine()

