# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.11.1
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci

# Copy application code
COPY --link . .


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]

ENV PORT=$PORT
ENV HOST=$HOST
ENV DB_USERNAME=$DB_USERNAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_NAME=$DB_NAME
ENV DB_AUTH=$DB_AUTH
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_RESET_SECRET=$JWT_RESET_SECRET
ENV SESSION_SECRET=$SESSION_SECRET
ENV CLIENT_ID=$CLIENT_ID
ENV CLIENT_SECRET=$CLIENT_SECRET
ENV REDIRECT_URI=$REDIRECT_URI
ENV FRONTEND_URL=$FRONTEND_URL
ENV EMAIL_USERNAME=$EMAIL_USERNAME
ENV EMAIL_PASSWORD=$EMAIL_PASSWORD
