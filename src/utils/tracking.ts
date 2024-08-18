import * as amplitude from "@amplitude/analytics-browser";
import { useAuth } from "@clerk/nextjs";
import { StripeError } from "@stripe/stripe-js";

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
  amplitude.init("ebf29143492929aa180a3b1a7777c146", {
    defaultTracking: true,
  });
  if (userId) {
    amplitude.setUserId(userId);
  }
  const { type, ...props } = event;
  amplitude.track(type, props);
}
