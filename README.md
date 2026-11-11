# Pet Heaven

A pet adoption website for Singapore, built with **React, Vite, JavaScript and React Router DOM**.
There is no backend and no database. Pets and care tips are local JavaScript data, and everything else
(accounts, the login session, favourites, reviews, pets released by members and adoption applications) is saved in the
browser's **localStorage**.

> **Security notice:** accounts are stored in localStorage (`petheaven_users`) with plain-text passwords, and the session
> (`petheaven_current_user`) is only an id, name and email. This is a student demonstration and **must not be used in
> production** or with real passwords. All contact details, reviews and organisation history are fictional.

## Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Sign up, login and adoption applications all work in the browser, with no server.

### Password rules
At least 8 characters, one uppercase letter, one lowercase letter and one number. Checked in the browser
(live checklist).

## Production build

```bash
npm run build      # creates the dist/ folder
npm run preview    # test the production build locally
```

## Folder structure

```
pet-heaven/
  public/ (favicon.svg, images/)
  src/
    components/  reusable parts (Navbar, Footer, Hero, PetCard, PetGrid, PetFilter, PetListing,
                 FormInput, ReviewCard, Accordion, Reveal, PetImage, PetGallery,
                 ProtectedRoute, ScrollToTop ...)
    context/     AuthContext.jsx (login state + favourites)
    data/        pets.js, reviews.js, petCareTips.js
    hooks/       useForm.js
    pages/       one file per page (15 pages)
    styles/      global.css, components.css, responsive.css
    utils/       storage.js (safe localStorage), validators.js, petProfile.js (profile helpers)
    App.jsx, main.jsx
  index.html, package.json, vercel.json, .gitignore
```

## Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/dogs`, `/cats` | Filterable pet lists |
| `/pets/:id` | Animal profile (photo gallery, medical, vaccinations, rescue story, requirements, compatibility) |
| `/adopt`, `/release` | Adoption and release forms |
| `/about`, `/mission`, `/contact` | Information pages |
| `/pet-care`, `/reviews` | Care guides, member reviews |
| `/login`, `/signup` | Member sign up and login
| `/profile`, `/favourites`, `/account`, `/adoption-history` | Member pages (login required) |
| `*` | 404 page |

## Data saved in localStorage

`petheaven_session`, `petheaven_favourites_<email>`, `petheaven_applications` (local copy), `petheaven_releases`,
`petheaven_messages`, `petheaven_reviews`, `petHeavenTheme`. To reset the demo: DevTools > Application > Local Storage > Clear.

Uploaded pet images (JPG, PNG or WebP, maximum 20 MB) are stored in **IndexedDB** (`petheaven_images_db`), not localStorage.
Each pet record in `petheaven_pets` keeps only an `imageId`, plus its own `releaseHistory` and `adoptionHistory`.
DevTools > Application > IndexedDB to inspect or clear the images.

## Release and adoption workflow

1. A logged-in customer submits **Release a Pet**. The pet is saved in the fleet as `pending` and waits for approval.
2. An employee approves it on **Releases**. The pet becomes `available`. Pet records are never deleted.
3. Other customers adopt it through the normal application. The customer who released it is blocked (checked by user ID in
   `releaseHistory`, both in the UI and when the application is submitted).
4. The pet becomes `adopted` only when an employee clicks **Complete adoption**. It then shows an Adopted badge, has no Adopt
   button, and appears in **My Adopted Pets** and the public **Adopted Animals** page.

## Changing pet photos

Photos come from Unsplash URLs in `src/data/pets.js`. To use your own, put images in `public/images/`
and set `image: '/images/buddy.jpg'`. If any image fails to load, a paw placeholder is shown automatically.

## Animal profiles

Every animal in `src/data/pets.js` has these extra fields, shown on the details page (`/pets/:id`):
`gallery`, `medicalStatus`, `vaccinationRecords` (`{ name, date, nextDue }`), `neutered`, `houseTrained`,
`goodWithChildren`, `goodWithCats`, `goodWithDogs` (each `'Yes'`, `'No'` or `'Unknown'`), `rescueStory` and `adoptionRequirements`.
Availability comes from the existing `status` field (Available, Pending or Adopted). Adopted animals stay on the Dogs and Cats pages with an "Adopted" badge.

The sample medical notes, vaccination dates and rescue stories are placeholders: replace them with your real records.
The gallery currently shows each main photo plus two differently framed views of it. To use real extra photos, set for example
`gallery: ['/images/pets/buddy.jpg', '/images/pets/buddy-2.jpg', '/images/pets/buddy-3.jpg']`.
Pets added through the forms have no profile fields yet, so the page shows "not recorded yet" for them.

## Feature testing

1. **Navigation:** click each link; the current page is highlighted. Try `/nonsense` for the 404 page.
2. **Filters:** on Dogs/Cats, search "Buddy", pick a breed, age, gender, size, and status; search "zzz" to see the empty message; press Reset filters.
3. **Pet details:** click anywhere on a card; use the photo gallery (buttons, thumbnails, Left and Right arrow keys); check the vaccination table and compatibility; try `/pets/999` for the missing-pet message; use Back and Related pets. Cooper (adopted) and Max (pending) show their badges.
4. **Sign up:** try a weak password, mismatched passwords, then a valid account. Sign up again with the same email to see the duplicate error.
5. **Login/logout:** your first name appears in the navbar; Log out returns to Home. `/profile` redirects to login when logged out.
6. **Favourites:** tap the heart on a card, then check your Profile.
7. **Adopt form:** submit empty (field errors), enter an invalid phone (e.g. 12345), then a valid one (e.g. 9123 4567). A success message appears and the form clears.
8. **Release form:** same checks; the image URL is optional but must start with http(s).
9. **Reviews:** log in with a customer account, choose stars, and write a review; it appears at the top immediately and survives refresh. Employee accounts are redirected to the Dashboard and cannot submit reviews.
10. **Pet care:** open and close the accordions; video cards open YouTube searches.
11. **Contact:** submit the form and open the FAQ items.

## Mobile responsiveness testing

Open DevTools (F12), turn on the device toolbar (Ctrl+Shift+M) and test **320, 375, 430, 768, 1024 and 1440 px**.
Check that: the hamburger menu opens/closes and closes after choosing a link; hero and grids stack; forms fit;
buttons are easy to tap; there is no sideways scrolling. Also try keyboard navigation (Tab) and enable
"prefers-reduced-motion" in DevTools Rendering to confirm animations stop.

## Deployment (Vercel)

1. Push the project to GitHub (`node_modules` and `dist` are ignored).
2. On vercel.com choose **Add New > Project** and import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
4. Deploy. `vercel.json` already rewrites all paths to `index.html`, so refreshing a page like `/dogs` works.

(For Netlify, add a `public/_redirects` file containing `/* /index.html 200`.)

## Troubleshooting

- **`npm` is not recognised:** install Node.js LTS from nodejs.org and restart the terminal.
- **Port already in use:** Vite will pick another port, or run `npm run dev -- --port 3000`.
- **Blank page:** open the browser console (F12) and read the first error; run `npm install` again.
- **Images missing:** check your internet connection (photos are remote). A placeholder shows if they fail.
- **Page refresh gives 404 after deployment:** make sure `vercel.json` (or `_redirects` on Netlify) is deployed.
