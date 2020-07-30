from django import forms

from .models import Game

class GameForm(forms.ModelForm):
    audio_source = forms.CharField(initial="default")
    video_source = forms.CharField(initial="default")

    class Meta:
        model = Game
        fields = ["num_players"]

class JoinGameForm(forms.Form):
    game_id = forms.CharField()
    audio_source = forms.CharField()
    video_source = forms.CharField()