FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* bun.lockb* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f bun.lockb ]; then npm install -g bun && bun install --no-save; \
  else npm install; \
  fi

COPY . .

RUN npm run build

FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
