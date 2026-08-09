# Scenario Content Details for SweetMe Mini-App

## Purpose

This document describes the Scenario Details screen to build in the SweetMe mini-app. The implementation should be ported from SweetMe web and can copy the SweetMe web visual style directly.

Primary references:

- SweetMe web screen: `sweetme-web/src/views/scenario-details/index.tsx`
- SweetMe web scenario API: `sweetme-web/src/api/modules/scenarios.ts`
- SweetMe web content-item unblur reference: `sweetme-web/src/api/modules/content-items.ts`
- Mini-app reference: current Scenario Details implementation, `src/api/scenarios.ts`, and `src/components/scenario-media-gallery/*`

## API Contract

Use the same scenario endpoint prefix as SweetMe web:

```txt
GET  /characters/scenarios/:id
GET  /characters/scenarios/:id/image
GET  /characters/scenarios/:id/video
GET  /characters/scenarios/:id/media-totals
POST /characters/scenarios/:id/unlock
POST /characters/scenarios/:id/video/:videoId/unblur
```

Media list endpoints accept pagination:

```ts
type MediaQuery = {
  explicitness?: Explicitness;
  skip?: number;
  take?: number;
};
```

Default page size should be `32`, matching SweetMe web and the mini-app reference.

Expected response shapes should support either raw data or a `{ data }` wrapper, because the mini-app API layer already handles both patterns.

```ts
type Paginated<T> = {
  data: T[];
  total: number;
  skip: number;
  take: number;
};

type ScenarioMediaTotals = {
  images: number;
  videos: number;
};
```

## Types and Constants

Scenario details should extend the normal scenario list item and include unlock state plus nested character data.

```ts
enum ContentItemType {
  Image = 'image',
  Video = 'video',
}

type ScenarioDetails = Scenario & {
  isUnlocked: boolean;
  character: Scenario['character'] & {
    age?: number;
  };
};

type ScenarioMedia = {
  id: string;
  url: string;
  previewUrl: string | null;
  type: ContentItemType;
  stage: number;
  isBlurred: boolean;
  createdAt: string;
};

type UnlockScenarioResponse = {
  scenario?: ScenarioDetails;
  user?: User;
};

type UnblurScenarioVideoResponse =
  | ScenarioMedia
  | { data: ScenarioMedia }
  | { item?: ScenarioMedia; video?: ScenarioMedia; user?: User }
  | { data: { item?: ScenarioMedia; video?: ScenarioMedia; user?: User } };
```

Use shared price constants instead of hardcoded literals:

```ts
const SCENARIO_CONTENT_PRICE = 400;
const IMAGE_PRICE = 5;
const VIDEO_PRICE = 20;
```

If SweetMe mini-app already has central payment constants, map these names to the existing source of truth rather than duplicating them.

## Page Behavior

Add a Scenario Details route:

```txt
/scenarios/:id
```

The page should show:

- scenario promo image as the primary visual anchor;
- scenario name;
- character name;
- optional character age;
- formatted character personality;
- scenario description;
- primary actions: Chat and Generate;
- full scenario unlock CTA;
- Image and Video tabs;
- media grid;
- bottom unlock dock after the user scrolls past the top details area.

Chat should keep SweetMe mini-app's current chat-start behavior. If the target app uses Telegram deep links, use the scenario slug/start param pattern already used in that app. If it uses in-app chat creation like SweetMe web, follow the web mutation flow.

Generate should be visible but disabled unless the SweetMe mini-app generation flow already exists.

Image/Video tab state may be mirrored into the URL as `?tab=image` or `?tab=video`. If implemented, opening a scenario with a valid tab query should load that tab and smoothly scroll to the media switch after the active media request finishes.

## Unlock Flows

There are three separate media access paths.

Full scenario unlock:

- Triggered by the main `Unlock all` CTA, bottom dock CTA, and locked image tiles.
- Opens the full scenario unlock modal copied from SweetMe web.
- Shows scenario title, background image, image/video totals, future-content badge, and price.
- Confirm calls `POST /characters/scenarios/:id/unlock`.
- On success, refresh scenario detail, media lists, media totals if relevant, and current user balance.
- If balance is insufficient or the backend reports payment state, route to the CREDITS purchase screen.

Locked image tile:

- Do not open gallery.
- Open the full scenario unlock modal.
- Do not add extra CSS blur to images if the backend already returns blurred image URLs.

Locked video tile:

- Do not open the full scenario unlock modal.
- Open a compact per-video unblur modal.
- Modal background is `previewUrl ?? url`, blurred and darkened.
- Center content includes a lock icon.
- CTA text is `Unlock`, followed by sparkles icon and `VIDEO_PRICE`.
- Confirm calls `POST /characters/scenarios/:id/video/:videoId/unblur`.
- If current credits is less than `VIDEO_PRICE`, skip the request and route to the credits purchase screen.
- On success, patch or invalidate the active video media list, refresh current user balance, close the modal, and open gallery at the newly unblurred video.

Payment handling:

- Treat insufficient balance, payment-required status, and backend actions like `BUY_CREDITS` as purchase redirects.
- The target screen should be the SweetMe mini-app credit purchase screen, not a subscription screen.

## Media Grid and Gallery

Media grid:

- Load images from `/image` and videos from `/video`.
- Do not apply an explicitness filter by default.
- Sort unlocked media before blurred media if matching SweetMe web behavior.
- Unlocked media opens gallery at the selected item.
- Locked media follows the unlock flow rules above.
- Videos should render `previewUrl` as poster when available.
- Locked video previews should be visibly blurred.

Gallery:

- Copy SweetMe web gallery behavior and visuals.
- Fullscreen overlay above mini-app navigation and docks.
- Uses blurred active media as backdrop.
- Shows the active image/video in a central stage.
- Shows thumbnails.
- Swipe left/right moves between media.
- Swipe down closes.
- Backdrop click and Escape close.
- Video slides use autoplay muted playsInline loop, custom play/pause, progress slider, and remaining time.
- Do not include save/liked action unless SweetMe mini-app explicitly supports collection saving.
- Locked media should not be included in gallery items.

## Visual Direction

This target is SweetMe mini-app, so copy SweetMe web visual direction directly.

Keep these mini-app constraints:

- mobile-first layout;
- safe-area aware overlays and docks;
- stable viewport behavior inside Telegram;
- no desktop-only hover dependency;
- tap targets large enough for mobile;
- bottom dock must not overlap mini-app navigation.

The SweetMe web scenario details page, unlock modal, gallery, tabs, and media grid can be used as direct visual references. Adapt only where mini-app shell, navigation, payment routing, or Telegram viewport requires it.

## Implementation Notes

Recommended data flow:

1. Fetch scenario detail with `GET /characters/scenarios/:id`.
2. Fetch active tab media with `GET /characters/scenarios/:id/image` or `/video`.
3. Fetch media totals when scenario is locked.
4. Build gallery items from unlocked media only.
5. On full unlock success, invalidate detail, media lists, totals, and user.
6. On video unblur success, patch the active media cache when possible, invalidate media lists, refresh user, and open gallery at the unlocked video.

Recommended query keys:

```ts
scenarioKeys.detail(id);
scenarioKeys.media(id, type, params);
scenarioKeys.mediaLists();
scenarioKeys.mediaTotals(id);
```

Use the app's existing API client so auth headers, Telegram init data, and response unwrap conventions remain centralized.

## Acceptance Tests

Run the target SweetMe mini-app build/typecheck and manually verify:

- `/scenarios/:id` loads scenario identity, description, and promo image.
- Chat CTA starts or opens chat using the target app's existing behavior.
- Generate CTA is disabled when the flow is not implemented.
- Image/Video tabs call the correct endpoints.
- Optional `?tab=image|video` opens the correct tab and scrolls after media load.
- Locked image opens full scenario unlock modal.
- Locked video opens per-video unblur modal.
- Video unblur calls `POST /characters/scenarios/:id/video/:videoId/unblur`.
- Insufficient CREDITS routes to the CREDITS purchase screen.
- Full unlock refreshes detail, media, totals, and user balance.
- Video unblur refreshes media and user balance, then opens gallery at the unlocked video.
- Gallery opens unlocked image/video at the selected item.
- Gallery swipe left/right, swipe down close, backdrop close, Escape close, and video controls work on mobile.
- Bottom unlock dock appears after scroll and does not overlap mini-app navigation.
