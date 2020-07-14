release: python manage.py migrate
web: gunicorn website.wsgi --log-file -
web2 : daphne website.asgi:application --port $PORT --bind 0.0.0.0 -v2 
worker: python manage.py runworker channels -v2
