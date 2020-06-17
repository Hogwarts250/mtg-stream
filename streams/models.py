from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Room(models.Model):
    owner = models.ForeignKeys(User, on_delete=models.Cascade, null=True)