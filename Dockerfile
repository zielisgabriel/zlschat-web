FROM node:24.5.0-alpine3.22 AS builder

WORKDIR /app
ARG NEXT_PUBLIC_API_HTTP_URL
ARG NEXT_PUBLIC_API_WEBSOCKET_URL
ARG JWT_PRIVATE_KEY
ENV NEXT_PUBLIC_API_HTTP_URL=${NEXT_PUBLIC_API_HTTP_URL}
ENV NEXT_PUBLIC_API_WEBSOCKET_URL=${NEXT_PUBLIC_API_WEBSOCKET_URL}
ENV JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY}
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

FROM node:24.5.0-alpine3.22 AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]