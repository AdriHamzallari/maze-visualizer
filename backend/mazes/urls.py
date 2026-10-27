from django.urls import path
from .views import health, generate_maze
urlpatterns = [
    path('health', health),
    path('api/mazes', generate_maze)
]
