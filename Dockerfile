# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- dev (hot-reload via docker-compose bind mount) ----
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ---- build ----
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---- serve (production) ----
# Static output only — matches the Bunny CDN/Storage deployment target.
# This stage is for local parity / alternate container hosting, not
# how the app actually reaches production.
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
