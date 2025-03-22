### built stage
FROM node:22-alpine as dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
#RUN npm run build

### run stage
#FROM nginx:alpine

#COPY --from=built /app/dist /usr/share/nginx/html/

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

