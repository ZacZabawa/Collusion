# Base stage with common dependencies
FROM node:18-alpine as base
RUN apk add --no-cache ruby ruby-dev build-base git

# Parser service
FROM base as parser
WORKDIR /app/parser
COPY services/parser/package*.json ./
RUN npm install
COPY services/parser .

# Jekyll service
FROM base as jekyll
WORKDIR /app/jekyll
COPY services/jekyll/Gemfile* ./
RUN gem install bundler jekyll
RUN bundle install
COPY services/jekyll .

# Admin UI service
FROM base as admin
WORKDIR /app/admin
COPY services/admin/package*.json ./
RUN npm install
COPY services/admin .

# Final stage
FROM nginx:alpine
COPY --from=parser /app/parser /app/parser
COPY --from=jekyll /app/jekyll /app/jekyll
COPY --from=admin /app/admin /app/admin
COPY services/nginx/nginx.conf /etc/nginx/nginx.conf 