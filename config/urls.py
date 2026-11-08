"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from lecciones import views as lecciones_views
from evaluacion import views as evaluacion_views
from simulador import views as simulador_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lecciones_views.inicio, name='teoria'),
    path('evaluacion/', evaluacion_views.inicio, name='evaluacion'),
    path('simulador/', simulador_views.inicio, name='simulador'),
]
