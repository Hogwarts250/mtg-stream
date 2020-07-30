from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.core.exceptions import ObjectDoesNotExist

from .models import Game
from .forms import GameForm, JoinGameForm

# Create your views here.
def home(request):
    return render(request, "streams/home.html")

def create_game(request):    
    if request.method == "POST":
        form = GameForm(request.POST)

        if form.is_valid():
            game = form.save(commit=False)
            game.game_id = get_random_string(16)
            game.save()

            return HttpResponseRedirect(reverse("streams:game", kwargs={
                "game_id": game.game_id,
                "video_source": form.cleaned_data["video_source"],
                "audio_source": form.cleaned_data["audio_source"]
            }))

    else:
        form = GameForm()

    context = {"form": form}
    
    return render(request, "streams/create_game.html", context)

def join_game(request, game_id=None):
    if "game_id" in request.GET and request.GET["game_id"]:
        print(request.GET["video_source"] + "\n" + request.GET["audio_source"])
        try:
            game = Game.objects.get(game_id=request.GET["game_id"])

            form = JoinGameForm(request.GET)
            if form.is_valid():
                video_source = form.cleaned_data["video_source"]
                audio_source = form.cleaned_data["audio_source"]
                
                return HttpResponseRedirect(reverse("streams:game", kwargs={
                    "game_id": game.game_id,
                    "video_source": video_source,
                    "audio_source": audio_source
                }))

            else:
                print(form.errors)
        
        except ObjectDoesNotExist:
            game_id = request.GET["game_id"]

    form = JoinGameForm()

    context = {"game_id": game_id, "form": form}

    return render(request, "streams/join_game.html", context)

def game(request, game_id, video_source=None, audio_source=None):
    context = {"game_id": game_id, "video_source": video_source, "audio_source": audio_source}

    return render(request, "streams/game.html", context)