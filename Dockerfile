FROM node:21-alpine3.19

#Install rsync
RUN apk update
RUN apk add rsync

# Set the environment variable
ENV PATH /app/node_modules/.bin:$PATH

# Create and define the node_modules's cache directory.
WORKDIR /usr/src/cache

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install
RUN npm install react-vertical-timeline-component
RUN npm install postgres
RUN npm install @supabase/supabase-js
RUN npm install @supabase/auth-ui-react
RUN npm install react-router-dom
RUN npm install -g netlify-cli
RUN npm install sass --save-dev
RUN npm install react-responsive-carousel --save

# Create and define the application's working directory.
WORKDIR /app

EXPOSE 3000