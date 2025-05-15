# two-factor-auth-template

## Project dependencies

- Docker
- Yarn

## Initial setup

Copy `.env.tpl` to `.env` and specify `AIDBOX_LICENSE`.
[https://aidbox.app/](https://aidbox.app/)

Install frontend requirements:
```
cd frontend
yarn
```

## Run

```
docker-compose up -d
cd frontend
yarn start
```
