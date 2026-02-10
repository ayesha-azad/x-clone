FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl

# Dependencies
FROM base AS deps

COPY ./package*.json .

RUN npm ci

# Builder
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Public variables usually needed at build time for Next.js inlining
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ARG NEXT_PUBLIC_PUBLIC_KEY
ARG NEXT_PUBLIC_URL_ENDPOINT
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ENV NEXT_PUBLIC_PUBLIC_KEY=$NEXT_PUBLIC_PUBLIC_KEY
ENV NEXT_PUBLIC_URL_ENDPOINT=$NEXT_PUBLIC_URL_ENDPOINT
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Secrets (CLERK_SECRET_KEY, SIGNING_SECRET, PRIVATE_KEY, DATABASE_URL)
# should NOT be args/env here. They are runtime variables.
# However, if 'prisma generate' needs them, it's usually fine as it only generates code.
# If 'npm run build' tries to connect to DB, it might fail. Only passing public vars for now.

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]