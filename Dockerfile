FROM debian
MAINTAINER hugo.rosenkranz@gmail.com

ENV PORT 80

RUN apt-get update

RUN apt-get install -y apache2 libapache2-mod-php7.0 

RUN rm /var/www/html/*

ADD ./src /var/www/html/

RUN chmod 777 /var/www/html/models

CMD sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && apachectl -D FOREGROUND