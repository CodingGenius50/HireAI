from django.shortcuts import render

from rest_framework import generics
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
)

from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile
from .serializers import ProfileSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer