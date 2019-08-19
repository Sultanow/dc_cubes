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
COPY --from=builder /build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 
