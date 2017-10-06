FROM ubuntu:14.04


# MAINTAINER xx <XX>
#
#
#
# EXPOSE 80
#
#
# CMD ["npm", "start"]



MAINTAINER Yeo Sung Jun <sjyeo88@gmail.com>

RUN apt-get update
RUN apt-get install -y nginx
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs
# RUN apt-get install -y npm

RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
RUN chown -R www-data:www-data /var/lib/nginx


ADD ./nginx/example /etc/nginx/sites-enabled/example
ADD ./nginx/example /etc/nginx/sites-available/example

#WORKDIR /etc/nginx
RUN /etc/init.d/nginx restart &


RUN mkdir -p /app
WORKDIR /app
ADD . /app

RUN npm install
ENV NODE_ENV development

EXPOSE 80

RUN node ./bin/www &
#CMD ["node ./bin/www"]
