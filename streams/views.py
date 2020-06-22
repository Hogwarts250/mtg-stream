from django.shortcuts import render
from django.http import StreamingHttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.core.exceptions import ObjectDoesNotExist

import cv2

from .models import Game
from .forms import GameForm

# Create your views here.
class VideoCamera(object):
    def __init__(self):
        self.cap = cv2.VideoCapture(0)

    def __del__(self):
        self.cap.release()

    def get_frame(self):
        # encode OpenCV raw frame to jpg
        ret, frame = self.cap.read()
        ret, jpeg = cv2.imencode(".jpg", frame)

        return jpeg.tobytes()

    def update(self):
        while True:
            (self.grabbed, self.frame) = self.cap.read()

def gen_frame(cam):
    cap = VideoCamera()
    
    while True:
        # yield the output frame in the byte format
        frame = cap.get_frame()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


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