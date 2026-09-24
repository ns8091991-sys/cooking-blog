# --- Этап 1: сборка ---
FROM node:20-alpine AS build

WORKDIR /app

# Аргумент для VITE_API_URL (пусто = относительные пути)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Зависимости
COPY package*.json ./
RUN npm ci

# Сборка
COPY . .
RUN npm run build

# --- Этап 2: nginx ---
FROM nginx:alpine

# Забираем собранный фронт из первого этапа
COPY --from=build /app/dist /usr/share/nginx/html

# Конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]