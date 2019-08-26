# Stage 1 - Build cubes
FROM node:10.16.1-alpine as builder
WORKDIR /
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN npm run build

# Stage 2 - Ship via nginx
FROM nginx:alpine
# Delete default index.html
RUN rm /usr/share/nginx/html/index.html
# Delete default nginx conf
RUN rm /etc/nginx/nginx.conf
 # COPY solr reverse proxy conf
COPY ./docker/dc_cubes/nginx.conf /etc/nginx/
 # COPY dc_cubes
COPY --from=builder /build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 
