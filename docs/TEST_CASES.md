# Future Studio Web Test Cases

## Automated E2E coverage

| ID | Area | Steps | Expected result | Automation |
| --- | --- | --- | --- | --- |
| PROD-001 | All Products | Open `/#/all-products` with mocked Supabase products. | Every returned product is visible. | `products.spec.ts` |
| PROD-002 | Category | Open `/#/tvc`. | Only products with category `tvc` are visible. | `products.spec.ts` |
| PROD-003 | Quick View | Click a product thumbnail. | Quick View opens with the correct title and media. | `products.spec.ts` |
| PROD-004 | Quick View | Press Escape while Quick View is open. | Quick View closes and the product page is usable. | `products.spec.ts` |
| AUTH-001 | Permissions | Open Products without an authenticated session. | Create, Edit, and Delete controls are hidden. | `products.spec.ts` |
| NAV-001 | Navigation | Open Products, Team, and Contact routes. | Each route renders its main page container. | `products.spec.ts` |
| RESP-001 | Mobile | Open Products using a mobile viewport and scroll down. | The document scrolls vertically and cards do not block touch scrolling. | `products.mobile.spec.ts` |
| RESP-002 | Mobile Quick View | Open Quick View using a mobile viewport. | Modal stays inside the viewport and closes with Escape. | `products.mobile.spec.ts` |
| VIS-001 | Desktop Products | Capture the complete All Products page. | Pixels match the approved desktop baseline. | `visual.spec.ts` |
| VIS-002 | Desktop Quick View | Open and capture the Quick View modal. | Pixels match the approved desktop baseline. | `visual.spec.ts` |
| VIS-003 | Mobile Products | Capture the complete All Products page on Pixel 7. | Pixels match the approved mobile baseline. | `visual.mobile.spec.ts` |
| VIS-004 | Mobile Quick View | Open and capture Quick View on Pixel 7. | Pixels match the approved mobile baseline. | `visual.mobile.spec.ts` |

## Admin test cases requiring an isolated Supabase test project

| ID | Area | Steps | Expected result |
| --- | --- | --- | --- |
| ADMIN-001 | Login | Sign in with a valid admin account. | Login changes to Admin and management controls appear. |
| ADMIN-002 | Create | Complete project details, add media blocks, confirm, and save. | Product is saved and appears in its selected category. |
| ADMIN-003 | Edit | Edit title, cover, partner logo, and Quick View blocks. | Changes remain after a page reload. |
| ADMIN-004 | Delete | Delete a product and confirm the warning. | Product is removed and does not return after reload. |
| ADMIN-005 | Validation | Submit required fields empty or use an unsupported URL. | A clear validation message appears and no row is written. |
| ADMIN-006 | RLS | Attempt insert, update, or delete without authentication. | Supabase rejects the request. |

## Commands

```bash
npm test
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
npm run test:e2e -- --update-snapshots
```
