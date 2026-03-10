FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx playwright install --with-deps chromium

EXPOSE 5173

CMD ["npm", "run", "dev"]