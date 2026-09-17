FROM node:18-alpine as build

WORKDIR /reactapp

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD npm run dev
#RUN npm run build

#FROM nginx:alpine

#COPY --from=build /reactapp/dist/ /usr/share/nginx/html