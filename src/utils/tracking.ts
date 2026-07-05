import * as amplitude from "@amplitude/analytics-browser";
import type { StripeError } from "@stripe/stripe-js";

let initialized = false;

function ensureAmplitudeInit() {
  if (initialized) return;
  amplitude.init("ebf29143492929aa180a3b1a7777c146", {
    defaultTracking: true,
  });
  initialized = true;
}

export type TrackingEvent =
  | {
      type: "pageview";
      page: string;
    }
  | {
      type: "photos.view";
      photoId: string;
      showId: string;
      showName: string;
    }
  | {
      type: "shows.view";
      showId: string;
      showName: string;
    }
  | {
      type: "photos.add-to-cart";
      photoId: string;
      showId: string;
      showName: string;
    }
  | {
      type: "photos.remove-from-cart";
      photoId: string;
      showId: string;
      showName: string;
    }
  | {
      type: "photos.checkout.click";
      cart: string;
    }
  | {
      type: "photos.checkout.error";
      error: StripeError;
      cart: string;
    }
  | {
      type: "photos.checkout.complete";
      metadata: string;
    };
export function trackEvent(event: TrackingEvent, userId?: string | null) {
  ensureAmplitudeInit();
  if (userId) {
    amplitude.setUserId(userId);
  }
  const { type, ...props } = event;
  amplitude.track(type, props);
}
