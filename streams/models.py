from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from functools import partial

# Create your models here.
class Game(models.Model):
    num_players = models.IntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(4)],
    )
    game_id = models.CharField(max_length=16, unique=True)