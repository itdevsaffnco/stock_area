# ===== Build Stage =====
FROM node:18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ===== Production Stage =====
FROM nginx:alpine

# Hapus default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy config nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build Vue
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]