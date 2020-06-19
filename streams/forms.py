from django import forms

from .models import Game

class GameForm(forms.ModelForm):
    class Meta:
        model = Game
        fields = ["num_of_players"]
        labels = {"num_of_players":""}