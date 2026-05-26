FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Локальный prisma без npx — иначе npx тянет registry.npmjs.org и падает при EAI_AGAIN/DNS
RUN ./node_modules/.bin/prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && npm run start:prod"]
