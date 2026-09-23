# GSM2MQTT Dashboard (HA Custom Card)

Lovelace Custom Card for managing the [GSM2MQTT](https://github.com/legoser/gsm2mqtt) gateway within Home Assistant.

This frontend plugin provides a rich dashboard to visualize your GSM modem's status (Signal, Balance, Operator), read the last incoming SMS, send SMS messages, and perform USSD or Call-Drop operations directly from the Home Assistant UI.

## 📦 Installation

### HACS (Recommended)

1. Open Home Assistant and navigate to **HACS**.
2. Go to **Frontend** -> **Custom repositories** (three dots in the top right corner).
3. Add the URL of this repository and select **Lovelace** as the category.
4. Click **Install** on the newly added "GSM2MQTT Dashboard" plugin.
5. Reload your browser cache.

### Manual Installation (For testing & development)

To test the card on your live Home Assistant instance without caching issues, follow these steps:

1. Clone the repository and build the code:
   ```bash
   npm install
   npm run build
   ```
2. Copy the generated file `dist/gsm2mqtt-card.js` to your Home Assistant `config/www/` folder. For example, place it at `config/www/gsm2mqtt/gsm2mqtt-card.js`.
3. In Home Assistant, navigate to **Settings -> Dashboards -> Resources** (or Lovelace Dashboards -> Resources).
4. Add a new resource:
   - **URL:** `/local/gsm2mqtt/gsm2mqtt-card.js?v=1`
   - **Resource Type:** JavaScript Module
5. **Important:** Browsers heavily cache JavaScript modules. When you update the card's code, copy the new file and **increment the version number** in the Resource URL (e.g., `?v=2`, `?v=3`). Then hard-refresh the page (Ctrl+F5).

## ⚙️ Card Configuration

Add the custom card to your Lovelace dashboard:

```yaml
type: custom:gsm2mqtt-card
modem_id: neoway_m590
title: GSM Gateway
topic_prefix: gsm2mqtt
```

- `modem_id` (Required): The ID of the modem as configured in your `gsm2mqtt` gateway.
- `title` (Optional): Title of the card. Default is `GSM2MQTT Dashboard`.
- `topic_prefix` (Optional): The MQTT topic prefix used by the gateway. Default is `gsm2mqtt`.

## 🤖 AI Integration (Home Assistant Assist)

To allow Home Assistant's built-in AI (Assist) to send SMS using your gateway, you can register a script that the AI can call.

Add the following to your `scripts.yaml` in Home Assistant:

```yaml
notify_gsm2mqtt_sms:
  alias: "Отправить SMS через GSM2MQTT"
  icon: "mdi:message-processing"
  fields:
    target:
      description: "Номер получателя в формате +79XXXXXXXXX"
      example: "+79001234567"
      required: true
    message:
      description: "Текст SMS сообщения"
      example: "Внимание!"
      required: true
  sequence:
    - service: mqtt.publish
      data:
        topic: "gsm2mqtt/modem/neoway_m590/sms/send"
        payload: >
          {
            "to": "{{ target }}",
            "text": "{{ message }}",
            "request_report": true
          }
```
*(Make sure to change `neoway_m590` to your actual `modem_id`)*

**Exposing to Assist:**
1. Navigate to **Settings -> Voice Assistants -> Expose**.
2. Find the script `Отправить SMS через GSM2MQTT` and enable it for Assist.
3. Now you can say or type to Assist: *"Отправь SMS на номер +79991234567 с текстом Привет!"*, and Assist will execute the script!

## 🛠 Development

The card is built using modern Home Assistant standards ([Lit](https://lit.dev/)).

```bash
npm install
npm run build
# Or to automatically rebuild on changes:
npm run watch
```
