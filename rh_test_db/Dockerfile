# pull official base image
FROM python:3.10

# set work directory
WORKDIR /app

# set environment variables: prevent python to write pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . /app/

# Ensure wait-for-it.sh is executable
RUN chmod +x /app/wait-for-it.sh

EXPOSE 5000