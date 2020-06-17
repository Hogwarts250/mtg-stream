from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Game(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    num_of_players = models.IntegerField(default=2)