FROM node:20.12
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY . ./
EXPOSE 5173
CMD [ "npm", "run", "dev" ]