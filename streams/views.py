from django.shortcuts import render
from django.http import StreamingHttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.core.exceptions import ObjectDoesNotExist

from .models import Game
from .forms import GameForm

# Create your views here.
def home(request):
    return render(request, "streams/home.html")

def create_game(request):    
    if request.method == "POST":
        form = GameForm(request.POST)

        if form.is_valid():
            game_instance = form.save(commit=False)
            game_instance.game_id = get_random_string(16)
            game_instance.save()

            return HttpResponseRedirect(reverse("streams:game", kwargs={"game_id": game_instance.game_id}))

    else:
        form = GameForm()

    context = {"form": form}
    
    return render(request, "streams/create_game.html", context)

def join_game(request):
    if "game_id" in request.GET and request.GET["game_id"]:
        try:
            game_instance = Game.objects.get(game_id=request.GET["game_id"])

            return HttpResponseRedirect(reverse("streams:game", kwargs={"game_id": game_instance.game_id}))
        
        except ObjectDoesNotExist:
            pass

    return render(request, "streams/join_game.html")

def game(request, game_id):
    context = {"game_id": game_id}

    return render(request, "streams/game.html", context)