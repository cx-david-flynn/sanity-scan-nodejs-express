# NodeJS Express Sanity
This project contains a **vulnerable** python application using Express do demonstrate Checkmarx' API Security solution.  
**Security note: The application is vulnerable by design. Do not use it as reference for secured applications.**

## Prerequisites

Before running the application, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org) (version 14 or later)
- [npm](https://www.npmjs.com) (Node Package Manager)

## Running
```
npm install
npm start
```

## Containerize
Execute from the folder
```
docker build -t <image name>:<tag>
```
docker build -t sanity-scan-nodejs:latest

## Run Container
```
docker run -d --rm -p 3000:3000 --name <containername> <imagename>
```
docker run -d --rm -p 3000:3000 --name sanity-scan sanity-scan-nodejs:latest
