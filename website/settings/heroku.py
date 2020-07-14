"""
Production Settings for Heroku
"""

import environ
import django_heroku

from website.settings.dev import *

# Activate Django-Heroku.
django_heroku.settings(locals())

env = environ.Env(
    # set casting, default value
    DEBUG=(bool, False)
)

# False if not in os.environ
DEBUG = env("DEBUG")

# raises Django's ImproperlyConfigured exception if SECRET_KEY not in os.environ
SECRET_KEY = env("SECRET_KEY")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# parse database connection url string
DATABASES = {
    # read os.environ["DATABASE_URL"] and raises ImproperlyConfigured exception if not found
    "default": env.db()
}