FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY src ./src
COPY public ./public

RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]