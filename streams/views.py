from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

import cv2

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
    template = loader.get_template("streams/home.html")
    context = {}

    return HttpResponse(template.render(context, request))

def create_game(request):
    template = loader.get_template("streams/create_game.html")
    context = {}

    return HttpResponse(template.render(context, request))

def join_game(request):
    template = loader.get_template("streams/join_game.html")
    context = {}
    
    return HttpResponse(template.render(context, request)) 

def game(request, game_id):
    template = loader.get_template("streams/game.html")
    context = {"game_id": game_id}

    return HttpResponse(template.render(context, template))