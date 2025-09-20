FROM node:20-alpine AS build

ARG NEXT_PUBLIC_API_URL_ARG
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL_ARG}

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Clean potential Next.js cache before building
RUN rm -rf .next
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./
COPY --from=build /app/next-i18next.config.js ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
