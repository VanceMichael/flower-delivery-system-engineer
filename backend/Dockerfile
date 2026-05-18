FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install --production=false

COPY . .

RUN npm run build 2>/dev/null || true

FROM --platform=$TARGETPLATFORM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install --production=true

COPY --from=builder /app/src ./src
COPY --from=builder /app/.env ./

EXPOSE 3000

CMD ["node", "src/app.js"]
