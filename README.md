# Guaçu News Scraping

Coleta notícias de Mogi Guaçu, Mogi Mirim e da Baixa Mogiana e envia título + link para um grupo de WhatsApp pela [Evolution API](https://github.com/EvolutionAPI/evolution-api).

Fluxo: cron 8h e 18h (America/Sao_Paulo) → scrapers → MySQL (dedupe por link) → Redis/BullMQ → WhatsApp.

## Fontes

- [O Regional](https://oregional.net/topico/mogiguacu/)
- [Portal da Cidade Mogi Mirim](https://mogimirim.portaldacidade.com/noticias)
- [Guaçu Agora](https://guacuagora.com.br/) (Playwright, por causa do Cloudflare)
- [Gazeta Guaçuana](https://www.gazetaguacuana.com.br/) (Playwright; o servidor responde 403 no fetch simples)
- [Tribuna do Guaçu](https://portaltribunadoguacu.com.br/) (só matérias locais)
- [Mogi Guaçu Acontece](https://mogiguacuacontece.com.br/)
- [O Impacto](https://oimpactomogi.com.br/tag/mogi-guacu/) (tags Mogi Guaçu e Mogi Mirim)
- [G1 Campinas e Região](https://g1.globo.com/sp/campinas-regiao/) (RSS filtrado pelas duas cidades)

## Homelab

O app **não** sobe MySQL, Redis nem Evolution. Usa os serviços que já existem no homelab:

| Serviço | Como o container acessa |
|---------|-------------------------|
| MySQL 8 (`database-mysql8`, porta 3306) | `host.docker.internal` |
| Redis (`redis`, porta 6379, sem senha) | `host.docker.internal`, `REDIS_DB=2` |
| Evolution API (porta 8080) | `http://host.docker.internal:8080` |

O schema (`database news`, tabela `news`) é criado/atualizado no boot. Health check na porta **3015** (a 3000 do homelab já está ocupada).

## Deploy

No homelab o padrão é o mesmo da landing da Bianca: um `docker compose up -d --build`.

```bash
cp .example.env .env
# preencha WhatsApp, MySQL e Redis com as credenciais do homelab

chmod +x deploy.sh
./deploy.sh
```

O script envia o projeto para `/mnt/hd_externo/apps/guacu-news-scrapping/` e sobe o container `guacu-news-scrapping`.

Health: `http://192.168.15.200:3015/health`

## Desenvolvimento local

```bash
cp .example.env .env
# aponte MYSQL_* e REDIS_* para o homelab (192.168.15.200)

npm install
npm run playwright:install
npm run start:dev
```

Coleta única, só listando no terminal (sem MySQL, Redis ou WhatsApp):

```bash
npm run scrape:once
```

`npm run database:seed` **apaga** a tabela `news` e só roda com `CONFIRM_DROP=true`. Não use no MySQL do homelab.

## Variáveis de ambiente

Veja [`.example.env`](.example.env). As que o app usa de fato:

| Variável | Função |
|----------|--------|
| `WHATSAPP_API_URL` | Base da Evolution, sem barra no final |
| `WHATSAPP_INSTANCE_NAME` | Instância no path `/message/sendText/{instance}` |
| `WHATSAPP_API_KEY` | Header `Apikey` |
| `WHATSAPP_GROUP_ID` | Número ou JID do grupo |
| `MYSQL_*` | Banco de deduplicação no MySQL do homelab |
| `REDIS_*` | Fila BullMQ no Redis do homelab |
| `HEALTH_PORT` | Porta do `/health` (dentro do container: 3000) |
| `SEND_DELAY_MS` | Intervalo entre envios no WhatsApp |
| `DRY_RUN` / `RUN_ONCE` | Listar sem persistir/enviar |

No Compose, `MYSQL_HOST`, `REDIS_HOST` e `WHATSAPP_API_URL` são sobrescritos para `host.docker.internal`.

## Testes

```bash
npm test
```

Os testes usam fixtures HTML/RSS. Não batem na rede.
