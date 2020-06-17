from django.shortcuts import render

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

def 

"""
cap = VideoCamera()

while True:
    # yield the output frame in the byte format
    yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
"""