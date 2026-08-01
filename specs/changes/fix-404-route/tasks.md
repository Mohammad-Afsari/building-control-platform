# Tasks — fix-404-route

## Implementation

- [ ] Add `src/routes/not-found.tsx` — `NotFoundPage`, with the Logo,
      the `MapPinOff` badge, the `Error 404` eyebrow, the heading
      "We can't find that page", the body copy, and a home link built
      from `Button` with `asChild`
- [ ] Register `<Route path="*" element={<NotFoundPage />} />` as the
      last child of `<Routes>` in `src/App.tsx`

## Tests

- [ ] `src/routes/not-found.test.tsx` — an unmatched path renders the
      not-found page
- [ ] `src/routes/not-found.test.tsx` — the heading reads "We can't
      find that page"
- [ ] `src/routes/not-found.test.tsx` — the document title is set
- [ ] `src/routes/not-found.test.tsx` — activating the home link
      navigates to `/`
- [ ] `src/routes/not-found.test.tsx` — the page has exactly one `h1`
- [ ] `src/routes/not-found.test.tsx` — regression: `/login` still
      renders the login page, proving the catch-all has not shadowed
      real routes

## Verification

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:run`
- [ ] Confirm the catch-all regression test genuinely bites: point the
      catch-all at a real path instead of `*`, watch the unmatched-path
      test fail, then restore it

End-to-end is not required. Nothing here crosses a network boundary or
touches auth, so the local Supabase suite would add minutes without
covering anything the unit tests miss.
