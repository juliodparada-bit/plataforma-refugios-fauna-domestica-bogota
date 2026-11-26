FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src
COPY docker-entrypoint.sh ./

RUN npm ci \
  && npx prisma generate \
  && npm run build \
  && chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
