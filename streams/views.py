from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse

import cv2

from .forms import GameForm

# Create your views here.
class VideoCamera(object):
    def __init__(self):
        self.cap = cv2.VideoCapture(0)

    def __del__(self):
        self.cap.release()

    def get_frame(self):
        ret, frame = self.cap.read()

        # encode OpenCV raw frame to jpg
        jpeg = cv2.imencode(".jpg", frame)

        return jpeg.tobytes()

"""
cap = VideoCamera()

while True:
    # yield the output frame in the byte format
    yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
"""

def home(request):
    return render(request, "streams/home.html")

def create_game(request):
    if request.method == "POST":
        return HttpResponseRedirect(reverse("streams:home"))

    else:
        form = GameForm()

    context = {"form": form}
    
    return render(request, "streams/create_game.html", context)

def join_game(request):
    return render(request, "streams/join_game.html")

def game(request, game_id):
    return render(request, "streams/game.html")