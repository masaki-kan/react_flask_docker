FROM python:3.8-slim-buster
WORKDIR /app
ADD . /app
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5001
ENV FLASK_ENV=development
CMD ["python", "app.py"]