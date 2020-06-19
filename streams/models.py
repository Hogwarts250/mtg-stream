from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

from functools import partial

# Create your models here.
class Game(models.Model):
    num_players = models.IntegerField()
    game_id = models.CharField(max_length=16, unique=True)