from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

from functools import partial

# Create your models here.
class Game(models.Model):
    #owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    num_of_players = models.IntegerField(default=2)

    game_id = models.CharField(default=get_random_string(16), max_length=16)